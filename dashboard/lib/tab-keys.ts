import type { Tab, ZombieTab } from "./types";

export function getTabListKey(tab: Tab, index: number, scope = "tab") {
  if (typeof tab.id === "number") {
    return `${scope}-${tab.id}-${index}`;
  }

  return [scope, tab.url, tab.title, tab.favicon ?? "", index].join("|");
}

export function getZombieTabKey(tab: ZombieTab, index: number) {
  return ["zombie", tab.url, tab.title, tab.appearances, index].join("|");
}
