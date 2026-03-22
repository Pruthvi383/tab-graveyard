const DEFAULT_DASHBOARD_URL = "https://tab-graveyard0.vercel.app";
const LOCAL_DASHBOARD_FALLBACKS = ["http://localhost:3000", "http://localhost:3001"];
const IDLE_MINUTES = 120;
const RECENT_SESSIONS_LIMIT = 5;

async function getStorage(keys) {
  return chrome.storage.local.get(keys);
}

async function setStorage(values) {
  return chrome.storage.local.set(values);
}

async function ensureSetup() {
  const current = await getStorage(["dashboard_url"]);
  const updates = {};

  if (!current.dashboard_url) {
    updates.dashboard_url = DEFAULT_DASHBOARD_URL;
  }

  if (Object.keys(updates).length) {
    await setStorage(updates);
  }

  chrome.alarms.create("idleCheck", { periodInMinutes: IDLE_MINUTES });
  await updateBadgeCount();
}

async function getRuntimeConfig() {
  const config = await getStorage([
    "dashboard_url",
    "extension_token",
    "recent_sessions",
    "last_groups",
    "last_saved_session",
    "connected_at",
  ]);

  return {
    dashboardUrl: config.dashboard_url || DEFAULT_DASHBOARD_URL,
    extensionToken: config.extension_token || "",
    recentSessions: config.recent_sessions || [],
    lastGroups: config.last_groups || [],
    lastSavedSession: config.last_saved_session || null,
    connectedAt: config.connected_at || null,
  };
}

async function fetchDashboard(path, init = {}) {
  const config = await getRuntimeConfig();

  if (!config.extensionToken) {
    throw new Error("Connect the extension with a personal token from the dashboard first.");
  }

  const candidates = [config.dashboardUrl, ...LOCAL_DASHBOARD_FALLBACKS.filter((url) => url !== config.dashboardUrl)];
  let lastResponse = null;
  let lastError = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-extension-token": config.extensionToken,
          ...(init.headers || {}),
        },
      });

      if (response.ok) {
        if (baseUrl !== config.dashboardUrl) {
          await setStorage({ dashboard_url: baseUrl });
        }

        return response;
      }

      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError || new Error("Unable to reach the dashboard API.");
}

async function resolveDashboardUrl() {
  const config = await getRuntimeConfig();
  const candidates = [config.dashboardUrl, ...LOCAL_DASHBOARD_FALLBACKS.filter((url) => url !== config.dashboardUrl)];

  if (!config.extensionToken) {
    return config.dashboardUrl;
  }

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}/api/stats`, {
        headers: {
          "x-extension-token": config.extensionToken,
        },
      });

      if (response.ok) {
        if (baseUrl !== config.dashboardUrl) {
          await setStorage({ dashboard_url: baseUrl });
        }

        return baseUrl;
      }
    } catch {
      continue;
    }
  }

  return config.dashboardUrl;
}

function isRealTab(tab) {
  return Boolean(tab.url && /^https?:/i.test(tab.url));
}

async function getPopupData() {
  const [tabs, config] = await Promise.all([
    chrome.tabs.query({ currentWindow: true }),
    getRuntimeConfig(),
  ]);
  const dashboardUrl = await resolveDashboardUrl();

  return {
    tabCount: tabs.filter(isRealTab).length,
    recentSessions: config.recentSessions,
    dashboardUrl,
    isConnected: Boolean(config.extensionToken),
    connectedAt: config.connectedAt,
    lastGroups: config.lastGroups,
    lastSavedSession: config.lastSavedSession,
  };
}

async function getTabContext(tabId) {
  if (!tabId) {
    return {};
  }

  try {
    return await chrome.tabs.sendMessage(tabId, { action: "getPageContext" });
  } catch {
    return {};
  }
}

async function collectTabsForGrouping() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const realTabs = tabs.filter(isRealTab);

  const enriched = await Promise.all(
    realTabs.map(async (tab) => {
      const context = await getTabContext(tab.id);

      return {
        id: tab.id,
        title: tab.title || "Untitled Tab",
        url: tab.url,
        favicon: tab.favIconUrl || "",
        lastAccessed: tab.lastAccessed,
        description: context.description || "",
      };
    }),
  );

  return enriched;
}

async function updateRecentSessions(session) {
  const { recentSessions } = await getRuntimeConfig();
  const next = [session, ...recentSessions.filter((item) => item.id !== session.id)].slice(0, RECENT_SESSIONS_LIMIT);
  await setStorage({ recent_sessions: next });
}

async function updateBadgeCount() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const count = String(tabs.filter(isRealTab).length);
  await chrome.action.setBadgeText({ text: count });
  await chrome.action.setBadgeBackgroundColor({ color: "hsl(240 3.7% 15.9%)" });
}

async function groupCurrentTabs() {
  const tabs = await collectTabsForGrouping();
  const response = await fetchDashboard("/api/tabs/group", {
    method: "POST",
    body: JSON.stringify({
      tabs,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Grouping request failed." }));
    throw new Error(payload.error || "Grouping request failed.");
  }

  const payload = await response.json();
  await setStorage({
    last_groups: payload.groups || [],
  });

  return payload;
}

async function archiveGroup(group) {
  const config = await getRuntimeConfig();
  const response = await fetchDashboard("/api/tabs/save", {
    method: "POST",
    body: JSON.stringify({
      topic: group.topic,
      tabs: group.tabs,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Archive request failed." }));
    throw new Error(payload.error || "Archive request failed.");
  }

  const payload = await response.json();

  const ids = group.tabs.map((tab) => tab.id).filter(Boolean);
  if (ids.length) {
    await chrome.tabs.remove(ids);
  }

  const savedSession = {
    id: payload.session.id,
    topic: payload.session.topic,
    createdAt: payload.session.createdAt,
    tabs: payload.session.tabs,
  };

  await updateRecentSessions(savedSession);
  await setStorage({
    last_saved_session: savedSession,
    last_groups: (config.lastGroups || []).filter((item) => item.topic !== group.topic),
  });

  await updateBadgeCount();

  return payload;
}

async function searchSessions(query) {
  const response = await fetchDashboard("/api/tabs/search", {
    method: "POST",
    body: JSON.stringify({
      query,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Search request failed." }));
    throw new Error(payload.error || "Search request failed.");
  }

  return response.json();
}

async function restoreTabs(tabs, sessionId) {
  const config = await getRuntimeConfig();

  for (const tab of tabs) {
    await chrome.tabs.create({ url: tab.url, active: false });
  }

  if (sessionId && config.extensionToken) {
    await fetchDashboard("/api/tabs/save", {
      method: "POST",
      body: JSON.stringify({
        action: "increment_restore",
        sessionId,
      }),
    }).catch(() => undefined);
  }

  await updateBadgeCount();
  return { ok: true };
}

async function suspendIdleTabs() {
  const config = await getRuntimeConfig();

  if (!config.extensionToken) {
    return;
  }

  const tabs = await chrome.tabs.query({});
  const now = Date.now();

  const idleTabs = tabs.filter(
    (tab) =>
      isRealTab(tab) &&
      typeof tab.lastAccessed === "number" &&
      now - tab.lastAccessed > IDLE_MINUTES * 60 * 1000,
  );

  if (!idleTabs.length) {
    return;
  }

  const payload = idleTabs.map((tab) => ({
    id: tab.id,
    title: tab.title || "Untitled Tab",
    url: tab.url,
    favicon: tab.favIconUrl || "",
    lastAccessed: tab.lastAccessed,
  }));

  await fetchDashboard("/api/tabs/suspend", {
    method: "POST",
    body: JSON.stringify({
      tabs: payload,
    }),
  }).catch(() => undefined);

  await Promise.all(
    idleTabs
      .filter((tab) => typeof tab.id === "number")
      .map((tab) => chrome.tabs.discard(tab.id).catch(() => undefined)),
  );
}

chrome.runtime.onInstalled.addListener(() => {
  ensureSetup();
});

chrome.runtime.onStartup.addListener(() => {
  ensureSetup();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "idleCheck") {
    suspendIdleTabs();
  }
});

chrome.tabs.onCreated.addListener(() => {
  updateBadgeCount();
});

chrome.tabs.onRemoved.addListener(() => {
  updateBadgeCount();
});

chrome.tabs.onActivated.addListener(() => {
  updateBadgeCount();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    switch (message.action) {
      case "getPopupData":
        sendResponse(await getPopupData());
        break;
      case "saveConnection": {
        const current = await getRuntimeConfig();
        const dashboardUrl = (message.dashboardUrl || current.dashboardUrl || DEFAULT_DASHBOARD_URL).trim();
        const extensionToken = (message.extensionToken || current.extensionToken || "").trim();

        if (extensionToken) {
          const response = await fetch(`${dashboardUrl}/api/stats`, {
            headers: {
              "x-extension-token": extensionToken,
            },
          });

          if (!response.ok) {
            throw new Error("Could not verify the dashboard URL and token. Paste both values again.");
          }
        }

        await setStorage({
          dashboard_url: dashboardUrl,
          extension_token: extensionToken,
          connected_at: extensionToken ? new Date().toISOString() : null,
        });

        sendResponse({
          ok: true,
          dashboardUrl,
          isConnected: Boolean(extensionToken),
          connectedAt: extensionToken ? new Date().toISOString() : null,
        });
        break;
      }
      case "groupTabs":
        sendResponse(await groupCurrentTabs());
        break;
      case "archiveGroup":
        sendResponse(await archiveGroup(message.group));
        break;
      case "searchSessions":
        sendResponse(await searchSessions(message.query || ""));
        break;
      case "restoreTabs":
        sendResponse(await restoreTabs(message.tabs || [], message.sessionId));
        break;
      case "openDashboard": {
        const dashboardUrl = await resolveDashboardUrl();
        await chrome.tabs.create({ url: dashboardUrl });
        sendResponse({ ok: true });
        break;
      }
      default:
        sendResponse({ ok: false, error: "Unknown action." });
    }
  })().catch((error) => {
    sendResponse({ ok: false, error: error instanceof Error ? error.message : "Unexpected extension error." });
  });

  return true;
});
