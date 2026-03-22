export interface Tab {
  id?: number;
  title: string;
  url: string;
  favicon?: string;
  description?: string;
  lastAccessed?: number;
}

export interface TabGroupResult {
  topic: string;
  emoji: string;
  tabs: Tab[];
}

export interface Session {
  id: string;
  userId: string;
  topic: string;
  emoji?: string;
  tabs: Tab[];
  createdAt: string;
  restoredCount: number;
}

export interface SearchResult {
  query: string;
  sessions: Session[];
}

export interface DashboardStats {
  totalArchived: number;
  sessionsThisWeek: number;
  ramSavedGb: number;
  zombieCount: number;
}

export interface ZombieTab {
  title: string;
  url: string;
  appearances: number;
}

export interface ExtensionTokenSummary {
  id: string;
  label: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}
