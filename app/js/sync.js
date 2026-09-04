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
    this.apiEndpoint = options.apiEndpoint || "/api/sync";

    // Batched Optimistic Queue state
    this.queueMap = new Map(); // key -> val
    this.flushTimer = null;
    this.debounceMs = 2000; // 2s adaptive debounced flush

    // Auto-drain on unload / tab hide
    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.flush();
      });
      window.addEventListener("beforeunload", () => {
        this.flush();
      });
    }
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
    // If pending in batch queue, return optimistic queued value immediately
    if (this.queueMap.has(key)) {
      return this.queueMap.get(key);
    }
    try {
      const res = await fetch(`${this.apiEndpoint}?key=${encodeURIComponent(key)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.result === undefined || data.result === null) return null;
      return typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    } catch {
      return null;
    }
  }

  async kvSet(key, val) {
    // Optimistic batch queueing: store locally and schedule flush in 2s
    this.queueMap.set(key, val);
    this.scheduleFlush();
    return true;
  }

  scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.debounceMs);
  }

  async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.queueMap.size === 0) return true;

    const payload = Array.from(this.queueMap.entries()).map(([key, val]) => ({ key, val }));
    this.queueMap.clear();

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon && document.visibilityState === "hidden") {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon(this.apiEndpoint, blob);
        return true;
      }

      const res = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      // On network failure, re-queue failed operations
      for (const item of payload) {
        if (!this.queueMap.has(item.key)) {
          this.queueMap.set(item.key, item.val);
        }
      }
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

  /**
   * Performs granular Item-Level Last-Write-Wins (LWW) merge.
   * Eliminates data loss between tablet reading and PC exercise work,
   * and cleanly handles unchecking without resurrecting old items.
   *
   * @param {string} username
   * @param {string} dataset
   * @param {Object} localEntries
   * @param {string|string[]} localStorageKeys - primary and legacy keys to read from and write to
   * @param {string[]} legacyFallbackDatasets - remote legacy datasets to merge
   */
  async syncLWWMap(username, dataset, localEntries = {}, localStorageKeys = [], legacyFallbackDatasets = []) {
    if (!username) {
      return { entries: localEntries, changed: false };
    }

    const primaryKey = this.getKey(username, dataset);
    const remoteResult = await this.fetchDataset(username, dataset);
    let remoteEntries = normalizeToLWWEntries(remoteResult?.value);

    // Merge any legacy fallback datasets from remote cloud (e.g. "studied", "skipped")
    if (Array.isArray(legacyFallbackDatasets)) {
      for (const fallbackDataset of legacyFallbackDatasets) {
        const fbRes = await this.fetchDataset(username, fallbackDataset);
        if (fbRes?.value) {
          const normFb = normalizeToLWWEntries(fbRes.value);
          for (const [id, rec] of Object.entries(normFb)) {
            if (rec.v === true) {
              normFb[id] = { v: fallbackDataset, t: 1 };
            }
          }
          remoteEntries = mergeLWW(remoteEntries, normFb);
        }
      }
    }

    // Read local storage from primary and all fallback keys
    const localKeys = Array.isArray(localStorageKeys)
      ? localStorageKeys
      : (localStorageKeys ? [localStorageKeys] : []);

    let localStoredEntries = {};
    if (typeof localStorage !== "undefined") {
      for (const key of localKeys) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = normalizeToLWWEntries(JSON.parse(raw));
            localStoredEntries = mergeLWW(localStoredEntries, parsed);
          }
        } catch { /* ignore */ }
      }
    }

    // Perform 3-way LWW merge: localStored -> remote -> local memory
    const mergedEntries = mergeLWW(localStoredEntries, remoteEntries, localEntries);

    // Check if anything changed compared to localEntries
    let changed = false;
    const lKeys = Object.keys(localEntries);
    const mKeys = Object.keys(mergedEntries);
    if (lKeys.length !== mKeys.length) {
      changed = true;
    } else {
      for (const k of mKeys) {
        if (!localEntries[k] || localEntries[k].v !== mergedEntries[k].v || localEntries[k].t !== mergedEntries[k].t) {
          changed = true;
          break;
        }
      }
    }

    const payload = {
      _type: "lww-v1",
      updatedAt: Date.now(),
      entries: mergedEntries,
    };

    // Save back to all provided local storage keys
    if (typeof localStorage !== "undefined") {
      for (const key of localKeys) {
        try {
          localStorage.setItem(key, JSON.stringify(payload));
        } catch { /* ignore */ }
      }
    }

    // Push merged LWW map to cloud
    if (Object.keys(mergedEntries).length > 0 || remoteResult?.isLegacy) {
      await this.kvSet(primaryKey, payload);
    }

    return { entries: mergedEntries, changed, payload };
  }
}

/**
 * Normalizes any format (legacy array of IDs, dictionary, or LWW envelope)
 * into a canonical item-level map: { [id]: { v: any, t: number } }
 */
export function normalizeToLWWEntries(raw) {
  const entries = {};
  if (!raw) return entries;

  if (Array.isArray(raw)) {
    for (const id of raw) {
      if (typeof id === "string" || typeof id === "number") {
        entries[String(id)] = { v: true, t: 1 };
      }
    }
    return entries;
  }

  if (typeof raw === "object") {
    const source = raw._type === "lww-v1" && raw.entries ? raw.entries : raw;
    for (const [id, rec] of Object.entries(source)) {
      if (id.startsWith("_")) continue;
      if (rec && typeof rec === "object") {
        const v = rec.v !== undefined ? rec.v : (rec.checked !== undefined ? rec.checked : (rec.status !== undefined ? rec.status : true));
        const t = rec.t || rec.updatedAt || rec.timestamp || 1;
        entries[id] = { v, t };
      } else {
        entries[id] = { v: rec, t: 1 };
      }
    }
  }

  return entries;
}

/**
 * Performs granular Last-Write-Wins (LWW) merge across multiple entry sources.
 * Sources are evaluated in order; entries with strictly higher timestamps (t) win.
 * For identical timestamps (e.g. baseline migration t === 1):
 * Active states ("studied", "skipped", true) ALWAYS prevail over default/false.
 */
export function mergeLWW(...sources) {
  const merged = {};
  for (const src of sources) {
    if (!src) continue;
    for (const [id, rec] of Object.entries(src)) {
      if (!rec) continue;
      const current = merged[id];
      if (!current) {
        merged[id] = { v: rec.v, t: rec.t || 1 };
      } else {
        const curTime = current.t || 0;
        const newTime = rec.t || 0;
        if (newTime > curTime) {
          merged[id] = { v: rec.v, t: newTime };
        } else if (newTime === curTime) {
          const isCurrentActive = current.v && current.v !== "default" && current.v !== false;
          const isNewActive = rec.v && rec.v !== "default" && rec.v !== false;
          if (!isCurrentActive && isNewActive) {
            merged[id] = { v: rec.v, t: newTime };
          } else if (isCurrentActive && !isNewActive) {
            // Retain active current state
          } else {
            // Later source overrides if equivalent activity
            merged[id] = { v: rec.v, t: newTime };
          }
        }
      }
    }
  }
  return merged;
}

export const syncEngine = new CloudSyncEngine();
