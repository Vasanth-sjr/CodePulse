/**
 * CodePulse API Service — centralized fetch wrapper for all backend calls.
 */

const API_BASE = '';

class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, options);

  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err.detail || err.error || res.statusText;
    } catch {
      detail = res.statusText;
    }
    throw new ApiError(res.status, `API Error (${res.status})`, detail);
  }

  return res.json();
}

/**
 * POST /api/github/fetch — Fetch and store repo commit data.
 */
export async function fetchRepository(repoUrl, token = '') {
  return request('POST', '/api/github/fetch', {
    repo_url: repoUrl,
    token: token || undefined,
  });
}

/**
 * POST /api/analysis/requirements — Run NLP requirement→commit mapping.
 */
export async function analyzeRequirements(requirements, repoId) {
  return request('POST', '/api/analysis/requirements', {
    requirements,
    repo_id: repoId,
  });
}

/**
 * GET /api/analysis/impact — Get developer impact scores.
 */
export async function getImpactScores(repoId) {
  return request('GET', `/api/analysis/impact?repo_id=${repoId}`);
}

/**
 * GET /api/analysis/risks — Get knowledge risk per module.
 */
export async function getKnowledgeRisks(repoId) {
  return request('GET', `/api/analysis/risks?repo_id=${repoId}`);
}

/**
 * GET /api/dashboard/summary — Get all dashboard data in one call.
 */
export async function getDashboardSummary(repoId) {
  return request('GET', `/api/dashboard/summary?repo_id=${repoId}`);
}

/**
 * GET /api/health — Health check.
 */
export async function healthCheck() {
  return request('GET', '/api/health');
}
