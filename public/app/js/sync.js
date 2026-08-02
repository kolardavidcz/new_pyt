/**
 * CloudSyncEngine — Modular, multi-project progress sync engine for Upstash Redis.
 *
 * Namespace isolation key format: <appId>:<username>:<dataset>
 * Example: pyt:kolard:studied (for Python project) or cpp:kolard:studied (for C++ project)
 */

export const DEFAULT_KV_URL = "https://tough-husky-101028.upstash.io";
export const DEFAULT_KV_TOKEN = "gQAAAAAAAYqkAAIgcDFiZjJmZTQ3MWE4OTg0MWJjOWUwYmY5ZjU3MGEzOTg3NA";

export class CloudSyncEngine {
  constructor(options = {}) {
    this.appId = options.appId || "pyt";
    this.kvUrl = options.kvUrl || DEFAULT_KV_URL;
    this.kvToken = options.kvToken || DEFAULT_KV_TOKEN;
  }

  /**
   * Generates the primary namespaced key.
   * @param {string} username
   * @param {string} dataset - e.g. "studied", "seen", "checklist", "exercises"
   */
  getKey(username, dataset) {
    const u = (username || "guest").toLowerCase().trim();
    return `${this.appId}:${u}:${dataset}`;
  }

  /**
   * Generates legacy key fallbacks for zero-data-loss migration.
   */
  getLegacyKeys(username, dataset) {
    const u = (username || "guest").toLowerCase().trim();
    return [
      `pcs-${dataset}-v1:${u}`,
      `pcs-${dataset}-v1`,
    ];
  }

  async kvGet(key) {
    try {
      const res = await fetch(`${this.kvUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.kvToken}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.result === undefined || data.result === null) return null;
      return typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    } catch {
      return null;
    }
  }

  async kvSet(key, val) {
    try {
      const res = await fetch(`${this.kvUrl}/set/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.kvToken}` },
        body: JSON.stringify(val),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Safe fetch with zero-data-loss fallback.
   * Checks primary key first, then legacy keys if primary key returns null.
   */
  async fetchDataset(username, dataset) {
    if (!username) return null;
    const primaryKey = this.getKey(username, dataset);
    const primaryVal = await this.kvGet(primaryKey);
    if (primaryVal !== null) {
      return { key: primaryKey, value: primaryVal, isLegacy: false };
    }

    // Check legacy fallbacks
    const legacyKeys = this.getLegacyKeys(username, dataset);
    for (const legKey of legacyKeys) {
      const legVal = await this.kvGet(legKey);
      if (legVal !== null) {
        return { key: primaryKey, value: legVal, isLegacy: true };
      }
    }
    return null;
  }

  /**
   * Performs non-destructive 3-way union merge for Set datasets (studied, seen, checklist).
   * Merges: Local memory Set + LocalStorage + Remote Cloud (Primary & Legacy).
   */
  async syncSet(username, dataset, localSet = new Set(), localStorageKey = null) {
    if (!username) {
      return { set: localSet, changed: false };
    }

    const primaryKey = this.getKey(username, dataset);
    const remoteResult = await this.fetchDataset(username, dataset);
    const remoteArray = Array.isArray(remoteResult?.value) ? remoteResult.value : [];

    // Also read local storage if key provided
    let localStoredArray = [];
    if (localStorageKey) {
      try {
        const raw = localStorage.getItem(localStorageKey);
        if (raw) localStoredArray = JSON.parse(raw);
      } catch { /* ignore */ }
    }

    // Perform 3-way union merge
    const mergedArray = Array.from(
      new Set([...localSet, ...localStoredArray, ...remoteArray])
    );
    const mergedSet = new Set(mergedArray);

    const changed =
      mergedSet.size !== localSet.size ||
      [...mergedSet].some((item) => !localSet.has(item));

    // Save back to local storage if key provided
    if (localStorageKey) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(mergedArray));
      } catch { /* ignore */ }
    }

    // Push merged set to primary namespaced key in Upstash Redis
    if (mergedArray.length > 0 || remoteResult?.isLegacy) {
      await this.kvSet(primaryKey, mergedArray);
    }

    return { set: mergedSet, changed, array: mergedArray };
  }

  /**
   * Performs merge for dictionary datasets (e.g. exercise progress, scores, code drafts).
   */
  async syncDict(username, dataset, localDict = {}, localStorageKey = null) {
    if (!username) {
      return { dict: localDict, changed: false };
    }

    const primaryKey = this.getKey(username, dataset);
    const remoteResult = await this.fetchDataset(username, dataset);
    const remoteDict = remoteResult?.value && typeof remoteResult.value === "object"
      ? remoteResult.value
      : {};

    let localStoredDict = {};
    if (localStorageKey) {
      try {
        const raw = localStorage.getItem(localStorageKey);
        if (raw) localStoredDict = JSON.parse(raw);
      } catch { /* ignore */ }
    }

    // Merge strategy: dict key overlay (remote overrides local unless local has newer timestamp)
    const mergedDict = { ...localStoredDict, ...localDict };

    for (const [key, remoteVal] of Object.entries(remoteDict)) {
      if (!mergedDict[key]) {
        mergedDict[key] = remoteVal;
      } else if (typeof remoteVal === "object" && remoteVal !== null) {
        const localVal = mergedDict[key];
        const remoteTime = remoteVal.updatedAt || remoteVal.timestamp || 0;
        const localTime = localVal.updatedAt || localVal.timestamp || 0;
        if (remoteTime >= localTime) {
          mergedDict[key] = { ...localVal, ...remoteVal };
        }
      }
    }

    const changed = JSON.stringify(mergedDict) !== JSON.stringify(localDict);

    if (localStorageKey) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(mergedDict));
      } catch { /* ignore */ }
    }

    if (Object.keys(mergedDict).length > 0 || remoteResult?.isLegacy) {
      await this.kvSet(primaryKey, mergedDict);
    }

    return { dict: mergedDict, changed };
  }
}

export const syncEngine = new CloudSyncEngine();
