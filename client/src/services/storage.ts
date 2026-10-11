import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'aswora_auth_token';
const USER_KEY = 'aswora_cached_user';
const THEME_KEY = 'aswora_theme';

export class StorageService {
  /**
   * Save bearer token in secure native preferences / storage
   */
  static async setToken(token: string): Promise<void> {
    try {
      await Preferences.set({ key: TOKEN_KEY, value: token });
    } catch {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  /**
   * Retrieve bearer token
   */
  static async getToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      if (value) return value;
    } catch {
      // fallback
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Remove token upon logout
   */
  static async removeToken(): Promise<void> {
    try {
      await Preferences.remove({ key: TOKEN_KEY });
    } catch {
      // fallback
    }
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Cache user profile locally
   */
  static async setUser(user: any): Promise<void> {
    const serialized = JSON.stringify(user);
    try {
      await Preferences.set({ key: USER_KEY, value: serialized });
    } catch {
      localStorage.setItem(USER_KEY, serialized);
    }
  }

  static async getUser(): Promise<any | null> {
    try {
      const { value } = await Preferences.get({ key: USER_KEY });
      if (value) return JSON.parse(value);
    } catch {
      // fallback
    }
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  static async removeUser(): Promise<void> {
    try {
      await Preferences.remove({ key: USER_KEY });
    } catch {
      // fallback
    }
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Theme persistence
   */
  static async setTheme(theme: 'dark' | 'light'): Promise<void> {
    try {
      await Preferences.set({ key: THEME_KEY, value: theme });
    } catch {
      localStorage.setItem(THEME_KEY, theme);
    }
  }

  static async getTheme(): Promise<'dark' | 'light' | null> {
    try {
      const { value } = await Preferences.get({ key: THEME_KEY });
      if (value === 'dark' || value === 'light') return value;
    } catch {
      // fallback
    }
    const val = localStorage.getItem(THEME_KEY);
    return val === 'dark' || val === 'light' ? val : null;
  }
}
