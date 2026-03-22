chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== "getPageContext") {
    return false;
  }

  const description =
    document.querySelector('meta[name="description"]')?.getAttribute("content") ||
    document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
    "";

  sendResponse({
    description,
    title: document.title || "",
  });

  return true;
});

