export const DEMO_STORAGE_KEY = "aegissight.demo.resources.v1";
export const emptyDemoStore = { devices: [], blocks: [] };

export function readDemoStore() {
  try { return { ...emptyDemoStore, ...JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || "{}") }; }
  catch { return emptyDemoStore; }
}
