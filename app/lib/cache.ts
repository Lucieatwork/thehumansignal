const mem = new Map<string, any>();
export function getCache(key: string) { return mem.get(key); }
export function setCache(key: string, value: any) { mem.set(key, value); }
export function hash(obj: any) { try { return JSON.stringify(obj); } catch { return String(obj); } }
