const tabCountEl = document.getElementById("tab-count");
const groupButtonEl = document.getElementById("group-button");
const groupResultsEl = document.getElementById("group-results");
const recentSessionsEl = document.getElementById("recent-sessions");
const searchInputEl = document.getElementById("search-input");
const searchResultsEl = document.getElementById("search-results");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const openDashboardEl = document.getElementById("open-dashboard");
const dashboardUrlInputEl = document.getElementById("dashboard-url-input");
const tokenInputEl = document.getElementById("token-input");
const saveConnectionButtonEl = document.getElementById("save-connection-button");
const archiveAllButtonEl = document.getElementById("archive-all-button");
const clearSearchButtonEl = document.getElementById("clear-search-button");
const connectionCopyEl = document.getElementById("connection-copy");
const connectionPillEl = document.getElementById("connection-pill");
const savedStatePanelEl = document.getElementById("saved-state-panel");
const savedStateTitleEl = document.getElementById("saved-state-title");
const savedStateCopyEl = document.getElementById("saved-state-copy");

let searchTimer = null;
let popupState = {
  isConnected: false,
  lastGroups: [],
  recentSessions: [],
  searchResults: [],
  lastSavedSession: null,
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function setStatus(message) {
  statusEl.textContent = message || "";
}

function setError(message) {
  if (!message) {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
    return;
  }

  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function sendMessage(payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(payload, (response) => {
      const runtimeError = chrome.runtime.lastError;

      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }

      if (response && response.ok === false && response.error) {
        reject(new Error(response.error));
        return;
      }

      resolve(response);
    });
  });
}

function setConnectedState(isConnected, connectedAt) {
  popupState.isConnected = isConnected;
  groupButtonEl.disabled = !isConnected;
  searchInputEl.disabled = !isConnected;

  if (isConnected) {
    connectionCopyEl.textContent = connectedAt
      ? `Connection saved ${dateFormatter.format(new Date(connectedAt))}.`
      : "Extension connected to your dashboard.";
    connectionPillEl.textContent = "Connected";
    connectionPillEl.className = "pill connected";
  } else {
    connectionCopyEl.textContent = "Connect your dashboard to group, archive, search, and restore.";
    connectionPillEl.textContent = "Setup";
    connectionPillEl.className = "pill idle";
  }
}

function renderSavedState() {
  const session = popupState.lastSavedSession;

  if (!session) {
    savedStatePanelEl.classList.add("hidden");
    return;
  }

  savedStatePanelEl.classList.remove("hidden");
  savedStateTitleEl.textContent = session.topic;
  savedStateCopyEl.textContent = `${session.tabs.length} tabs saved for quick restore.`;
}

function renderGroups() {
  const groups = popupState.lastGroups;
  archiveAllButtonEl.classList.toggle("hidden", groups.length < 2);

  if (!groups.length) {
    groupResultsEl.innerHTML = popupState.isConnected
      ? '<p class="subtle">Click "Group Current Tabs" to create archive-ready tab sets.</p>'
      : '<p class="subtle">Connect the extension first, then group your current tabs.</p>';
    return;
  }

  groupResultsEl.innerHTML = groups
    .map(
      (group, index) => `
        <div class="group-card">
          <div class="row start">
            <div>
              <p class="session-topic">${group.emoji || "🪦"} ${group.topic}</p>
              <p class="helper">${group.tabs.length} tabs ready to save</p>
            </div>
            <div class="group-actions">
              <button class="archive-button" data-archive-index="${index}">Archive</button>
              <button class="toggle-button" data-group-index="${index}">Open</button>
            </div>
          </div>
          <div class="group-tabs" id="group-tabs-${index}">
            ${group.tabs
              .map(
                (tab) => `
                  <div class="tab-item">
                    <p class="tab-title">${tab.title}</p>
                    <p class="tab-url">${tab.url}</p>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      `,
    )
    .join("");

  groupResultsEl.querySelectorAll("[data-group-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = button.getAttribute("data-group-index");
      const target = document.getElementById(`group-tabs-${index}`);
      const isOpen = target.classList.toggle("open");
      button.textContent = isOpen ? "Hide" : "Open";
    });
  });

  groupResultsEl.querySelectorAll("[data-archive-index]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.getAttribute("data-archive-index"));
      await archiveGroup(index);
    });
  });
}

function renderRecentSessions() {
  const sessions = popupState.recentSessions;

  if (!sessions.length) {
    recentSessionsEl.innerHTML = '<p class="subtle">Archive a group and it will stay here for quick restore.</p>';
    return;
  }

  recentSessionsEl.innerHTML = sessions
    .map(
      (session) => `
        <div class="session-card">
          <div class="row start">
            <div>
              <p class="session-topic">${session.topic}</p>
              <p class="helper">${session.tabs.length} tabs</p>
            </div>
            <button class="ghost-button" data-session-id="${session.id}">Restore</button>
          </div>
        </div>
      `,
    )
    .join("");

  recentSessionsEl.querySelectorAll("[data-session-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const session = popupState.recentSessions.find((item) => item.id === button.getAttribute("data-session-id"));

      if (!session) {
        return;
      }

      setError("");
      setStatus(`Restoring ${session.topic}...`);

      try {
        await sendMessage({
          action: "restoreTabs",
          tabs: session.tabs,
          sessionId: session.id,
        });
        setStatus(`Restored ${session.tabs.length} tabs.`);
      } catch (error) {
        setError(error.message);
        setStatus("");
      }
    });
  });
}

function renderSearchResults() {
  const query = searchInputEl.value.trim();
  const results = popupState.searchResults;
  clearSearchButtonEl.classList.toggle("hidden", !query);

  if (!query) {
    searchResultsEl.innerHTML = '<p class="subtle">Search results will appear here.</p>';
    return;
  }

  if (query.length < 3) {
    searchResultsEl.innerHTML = '<p class="subtle">Type at least 3 characters to search saved sessions.</p>';
    return;
  }

  if (!results.length) {
    searchResultsEl.innerHTML = '<p class="subtle">No saved sessions matched that search.</p>';
    return;
  }

  searchResultsEl.innerHTML = results
    .map(
      (session) => `
        <div class="session-card">
          <div class="row start">
            <div>
              <p class="session-topic">${session.topic}</p>
              <p class="helper">${dateFormatter.format(new Date(session.createdAt))} • ${session.tabs.length} tabs</p>
            </div>
            <button class="ghost-button" data-search-session-id="${session.id}">Restore</button>
          </div>
        </div>
      `,
    )
    .join("");

  searchResultsEl.querySelectorAll("[data-search-session-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const session = popupState.searchResults.find((item) => item.id === button.getAttribute("data-search-session-id"));

      if (!session) {
        return;
      }

      setError("");
      setStatus(`Restoring ${session.topic}...`);

      try {
        await sendMessage({
          action: "restoreTabs",
          tabs: session.tabs,
          sessionId: session.id,
        });
        setStatus(`Restored ${session.tabs.length} tabs.`);
      } catch (error) {
        setError(error.message);
        setStatus("");
      }
    });
  });
}

async function loadPopupData() {
  setError("");

  try {
    const payload = await sendMessage({ action: "getPopupData" });
    popupState.lastGroups = payload.lastGroups || [];
    popupState.recentSessions = payload.recentSessions || [];
    popupState.lastSavedSession = payload.lastSavedSession || null;

    tabCountEl.textContent = `${payload.tabCount} tabs`;
    dashboardUrlInputEl.value = payload.dashboardUrl || "";
    tokenInputEl.value = "";
    setConnectedState(Boolean(payload.isConnected), payload.connectedAt);
    renderSavedState();
    renderGroups();
    renderRecentSessions();
    renderSearchResults();
    openDashboardEl.dataset.href = payload.dashboardUrl;
  } catch (error) {
    setError(error.message);
  }
}

async function archiveGroup(index) {
  const group = popupState.lastGroups[index];

  if (!group) {
    return;
  }

  setError("");
  setStatus(`Archiving ${group.topic}...`);

  try {
    const payload = await sendMessage({
      action: "archiveGroup",
      group,
    });

    popupState.lastSavedSession = payload.session;
    popupState.lastGroups = popupState.lastGroups.filter((_, currentIndex) => currentIndex !== index);
    renderSavedState();
    renderGroups();
    await loadPopupData();
    setStatus(`Saved ${group.tabs.length} tabs into ${group.topic}.`);
  } catch (error) {
    setError(error.message);
    setStatus("");
  }
}

async function archiveAllGroups() {
  if (!popupState.lastGroups.length) {
    return;
  }

  archiveAllButtonEl.disabled = true;

  try {
    const groups = [...popupState.lastGroups];

    for (const group of groups) {
      setStatus(`Archiving ${group.topic}...`);
      await sendMessage({
        action: "archiveGroup",
        group,
      });
    }

    await loadPopupData();
    setStatus(`Saved ${groups.length} grouped sessions.`);
  } catch (error) {
    setError(error.message);
    setStatus("");
  } finally {
    archiveAllButtonEl.disabled = false;
  }
}

groupButtonEl.addEventListener("click", async () => {
  setError("");
  setStatus("Grouping current tabs...");
  groupButtonEl.disabled = true;

  try {
    const payload = await sendMessage({ action: "groupTabs" });
    popupState.lastGroups = payload.groups || [];
    renderGroups();
    setStatus(`Built ${popupState.lastGroups.length} archive-ready groups.`);
  } catch (error) {
    setError(error.message);
    setStatus("");
  } finally {
    groupButtonEl.disabled = !popupState.isConnected;
  }
});

archiveAllButtonEl.addEventListener("click", async () => {
  await archiveAllGroups();
});

searchInputEl.addEventListener("input", () => {
  const query = searchInputEl.value.trim();

  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  if (!query) {
    popupState.searchResults = [];
    renderSearchResults();
    setStatus("");
    return;
  }

  if (query.length < 3) {
    popupState.searchResults = [];
    renderSearchResults();
    return;
  }

  searchTimer = setTimeout(async () => {
    setError("");
    setStatus("Searching saved sessions...");

    try {
      const payload = await sendMessage({
        action: "searchSessions",
        query,
      });
      popupState.searchResults = payload.sessions || [];
      renderSearchResults();
      setStatus(`Found ${popupState.searchResults.length} matching sessions.`);
    } catch (error) {
      setError(error.message);
      setStatus("");
    }
  }, 350);
});

clearSearchButtonEl.addEventListener("click", () => {
  searchInputEl.value = "";
  popupState.searchResults = [];
  renderSearchResults();
  setStatus("");
});

openDashboardEl.addEventListener("click", async (event) => {
  event.preventDefault();
  await sendMessage({ action: "openDashboard" });
});

saveConnectionButtonEl.addEventListener("click", async () => {
  setError("");
  setStatus("Verifying dashboard connection...");

  try {
    const payload = await sendMessage({
      action: "saveConnection",
      dashboardUrl: dashboardUrlInputEl.value.trim(),
      extensionToken: tokenInputEl.value.trim(),
    });

    setConnectedState(Boolean(payload.isConnected), payload.connectedAt);
    setStatus(payload.isConnected ? "Connection saved." : "Connection cleared.");
    await loadPopupData();
  } catch (error) {
    setError(error.message);
    setStatus("");
  }
});

loadPopupData();
