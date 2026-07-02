const STORAGE_PREFIX = "studypilot_";

type StorableValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: StorableValue }
  | StorableValue[];

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T extends StorableValue>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(storageKey(key), serialized);
  } catch {
    // Storage full or unavailable — silently skip
  }
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    return safeJsonParse(raw, fallback);
  } catch {
    return fallback;
  }
}

export function removeFromStorage(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(storageKey(key));
  } catch {
    // silently skip
  }
}

export function clearAllStorage(): void {
  if (!isBrowser()) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // silently skip
  }
}

/**
 * Persist mobile app state to localStorage.
 */
export interface PersistedMobileState {
  goalInput: string;
  activeTab: string;
  program: unknown | null;
  messages: unknown[];
  practiceQuestions: unknown[];
  selectedNode: unknown | null;
  knowledgeExplanation: unknown | null;
  expandedDay: number;
  expandedModuleId: string | null;
  aiStatus: string;
}

const MOBILE_STATE_KEY = "mobile_state";

export function saveMobileState(state: Record<string, StorableValue>): void {
  saveToStorage(MOBILE_STATE_KEY, state);
}

export function loadMobileState(): Partial<PersistedMobileState> {
  return loadFromStorage<Partial<PersistedMobileState>>(MOBILE_STATE_KEY, {});
}

/**
 * Persist desktop home app state to localStorage.
 */
export interface PersistedHomeState {
  learningGoal: string;
  activeModule: string;
  plannerSummary: unknown | null;
  messages: unknown[];
  practiceQuestions: unknown[];
  selectedKnowledgeId: string;
  selectedRouteId: string;
  expandedRouteId: string;
}

const HOME_STATE_KEY = "home_state";

export function saveHomeState(state: Record<string, StorableValue>): void {
  saveToStorage(HOME_STATE_KEY, state);
}

export function loadHomeState(): Partial<PersistedHomeState> {
  return loadFromStorage<Partial<PersistedHomeState>>(HOME_STATE_KEY, {});
}
