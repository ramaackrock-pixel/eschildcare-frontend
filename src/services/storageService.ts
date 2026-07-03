/**
 * Storage Service
 * Handles interaction with localStorage in a structured way.
 * This can be easily replaced with an Axios/Fetch based API service later.
 */

const STORAGE_PREFIX = 'physio_';

export const storageService = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
    }
  },

  /**
   * Generates a unique ID (high-entropy)
   */
  generateId(): string {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }
};
