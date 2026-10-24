const STORAGE_KEY = 'txman.access_token';

let memoryToken: string | null = null;

/**
 * Access-token storage. Used localStorage for simplicity.
 */
export const tokenStore = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    memoryToken = localStorage.getItem(STORAGE_KEY);
    return memoryToken;
  },

  set(token: string): void {
    memoryToken = token;
    localStorage.setItem(STORAGE_KEY, token);
  },

  clear(): void {
    memoryToken = null;
    localStorage.removeItem(STORAGE_KEY);
  },
};
