/**
 * DisasterWatch AI — Backend API Client
 * Connects to NirikshakAI FastAPI Core (http://localhost:8000)
 * Features automatic Vite proxy fallback and graceful offline detection.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 6000;

/**
 * Fetch wrapper with timeout and error handling
 */
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
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Helper to attempt request across multiple endpoints:
 * 1. Direct API_BASE_URL (http://localhost:8000)
 * 2. Relative URL (Proxied by Vite dev server to port 8000)
 * 3. /api prefixed endpoints
 */
async function requestWithFallback(pathWithQuery, options = {}) {
  const normalizedPath = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  
  const candidateUrls = [
    `${API_BASE_URL}${normalizedPath}`,
    normalizedPath,
    `${API_BASE_URL}/api${normalizedPath}`,
    `/api${normalizedPath}`,
  ];

  let lastError = null;
  for (const url of candidateUrls) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Network failure connecting to ${pathWithQuery}`);
}

/**
 * Primary API Services
 */
export const api = {
  baseUrl: API_BASE_URL,

  /**
   * Check backend server health
   */
  async checkHealth() {
    try {
      const data = await requestWithFallback("/health");
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch disaster reports with optional query params
   */
  async getReports(params = {}) {
    const query = new URLSearchParams();
    if (params.verdict && params.verdict !== "all") query.append("verdict", params.verdict);
    if (params.hazard && params.hazard !== "all") query.append("hazard", params.hazard);
    if (params.district) query.append("district", params.district);
    if (params.platform && params.platform !== "all") query.append("platform", params.platform);
    if (params.limit) query.append("limit", params.limit.toString());
    else query.append("limit", "250");

    const qs = query.toString() ? `?${query.toString()}` : "";

    try {
      const data = await requestWithFallback(`/reports${qs}`);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  },

  /**
   * Fetch single report by report_id
   */
  async getReportById(reportId) {
    try {
      const data = await requestWithFallback(`/reports/${reportId}`);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch clustered incidents
   */
  async getIncidents(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.priority) query.append("priority", params.priority);
    if (params.district) query.append("district", params.district);
    if (params.limit) query.append("limit", params.limit.toString());
    else query.append("limit", "100");

    const qs = query.toString() ? `?${query.toString()}` : "";

    try {
      const data = await requestWithFallback(`/incidents${qs}`);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  },

  /**
   * Fetch ingestion & verification statistics
   */
  async getStats() {
    try {
      const data = await requestWithFallback("/stats");
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Trigger real-time live ingestion on backend
   * Accepts TriggerIngestRequest: { sources, mock_count, state_or_district }
   */
  async triggerIngestion(payload = {}) {
    const body = {
      sources: payload.sources || ["sachet", "imd", "gdelt", "openmeteo", "mock"],
      mock_count: payload.mock_count || 20,
      state_or_district: payload.state_or_district || "Punjab",
    };

    try {
      const data = await requestWithFallback("/reports/trigger", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Trigger Deduplication pipeline on backend
   */
  async triggerDedup(params = {}) {
    const query = new URLSearchParams();
    query.append("eps_km", (params.eps_km || 5.0).toString());
    query.append("time_window_min", (params.time_window_min || 45).toString());
    query.append("limit", (params.limit || 200).toString());

    try {
      const data = await requestWithFallback(`/dedup?${query.toString()}`, {
        method: "POST",
      });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
