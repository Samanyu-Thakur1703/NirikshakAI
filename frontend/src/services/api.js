/**
 * Backend API client with direct, Vite-proxy, and /api fallback endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestWithFallback(pathWithQuery, options = {}) {
  const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  const urls = [
    `${API_BASE_URL}${path}`,
    path,
    `${API_BASE_URL}/api${path}`,
    `/api${path}`,
  ];
  let lastError;
  for (const url of urls) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`Network failure connecting to ${pathWithQuery}`);
}

export const api = {
  baseUrl: API_BASE_URL,

  async checkHealth() {
    try {
      return { success: true, data: await requestWithFallback("/health") };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getReports(params = {}) {
    const query = new URLSearchParams();
    if (params.verdict && params.verdict !== "all") query.append("verdict", params.verdict);
    if (params.hazard && params.hazard !== "all") query.append("hazard", params.hazard);
    if (params.district) query.append("district", params.district);
    if (params.platform && params.platform !== "all") query.append("platform", params.platform);
    query.append("limit", String(params.limit || 250));
    try {
      const suffix = query.toString() ? `?${query}` : "";
      return { success: true, data: await requestWithFallback(`/reports${suffix}`) };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  async getReportById(reportId) {
    try {
      return { success: true, data: await requestWithFallback(`/reports/${reportId}`) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getIncidents(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.priority) query.append("priority", params.priority);
    if (params.district) query.append("district", params.district);
    query.append("limit", String(params.limit || 100));
    try {
      const suffix = query.toString() ? `?${query}` : "";
      return { success: true, data: await requestWithFallback(`/incidents${suffix}`) };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  async getStats() {
    try {
      return { success: true, data: await requestWithFallback("/stats") };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async triggerIngestion(payload = {}) {
    const body = {
      sources: payload.sources || ["sachet", "imd", "gdelt", "openmeteo", "mock"],
      mock_count: payload.mock_count || 20,
      state_or_district: payload.state_or_district || "Punjab",
    };
    try {
      return {
        success: true,
        data: await requestWithFallback("/reports/trigger", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async triggerDedup(params = {}) {
    const query = new URLSearchParams({
      eps_km: String(params.eps_km || 5),
      time_window_min: String(params.time_window_min || 45),
      limit: String(params.limit || 200),
    });
    try {
      return {
        success: true,
        data: await requestWithFallback(`/dedup?${query}`, { method: "POST" }),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async dispatchAlert(incidentId) {
    try {
      return {
        success: true,
        data: await requestWithFallback(`/incidents/${incidentId}/dispatch`, { method: "POST" }),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
