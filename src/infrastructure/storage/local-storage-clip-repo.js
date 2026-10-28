export const STORE_KEY = 'clipkit.web.v1';

export class LocalStorageClipRepository {
  constructor(key = STORE_KEY) {
    this.key = key;
  }

  loadSavedClips() {
    try {
      if (typeof localStorage === 'undefined') return {};
      return JSON.parse(localStorage.getItem(this.key) || '{}') || {};
    } catch (_e) {
      return {};
    }
  }

  saveClips(data) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (_e) {}
  }
}

export class InMemoryClipRepository {
  constructor(initial = {}) {
    this.data = { ...initial };
  }

  loadSavedClips() {
    return { ...this.data };
  }

  saveClips(data) {
    this.data = { ...data };
  }
}
