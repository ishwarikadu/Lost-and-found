 //api.js

const BASE_URL = "http://127.0.0.1:8000/api";

// helper to get token
function getToken() {
  return localStorage.getItem("token");
}

// helper for headers
function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  };
}

/* ===================== AUTH ===================== */

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (result.access) {
    localStorage.setItem("token", result.access);
  }
  return result;
}

/* ===================== REPORTS ===================== */

export async function getReports(params = "") {
  const res = await fetch(`${BASE_URL}/reports/${params}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getReportById(id) {
  const res = await fetch(`${BASE_URL}/reports/${id}/`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createReport(formData) {
  const res = await fetch(`${BASE_URL}/reports/`, {
    method: "POST",
    headers: authHeaders(),
    body: formData, // multipart/form-data
  });
  return res.json();
}

export async function updateReport(id, formData) {
  const res = await fetch(`${BASE_URL}/reports/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function deleteReport(id) {
  const res = await fetch(`${BASE_URL}/reports/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function markReportReturned(id) {
  const res = await fetch(`${BASE_URL}/reports/${id}/mark-returned/`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
}

/* ===================== MATCHES ===================== */

// get matches for a specific report (user or admin)
export async function getReportMatches(reportId) {
  const res = await fetch(`${BASE_URL}/reports/${reportId}/matches/`, {
    headers: authHeaders(),
  });
  return res.json();
}

// admin only
export async function getUnmatchedReports() {
  const res = await fetch(`${BASE_URL}/reports/unmatched/`, {
    headers: authHeaders(),
  });
  return res.json();
}

// admin only
export async function getMatchesByStatus(status) {
  const res = await fetch(`${BASE_URL}/matches/${status}/`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function approveMatch(matchId) {
  const res = await fetch(`${BASE_URL}/matches/${matchId}/approve/`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
}

export async function rejectMatch(matchId) {
  const res = await fetch(`${BASE_URL}/matches/${matchId}/reject/`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
}

/* ===================== AI MATCHING (ADMIN) ===================== */

const AI_KEY = "your_internal_ai_key"; // same as backend .env

export async function runAIMatch(reportId) {
  const res = await fetch(`${BASE_URL}/ai/match/`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
      "X-AI-KEY": AI_KEY,
    }),
    body: JSON.stringify({ report_id: reportId }),
  });
  return res.json();
}

/* ===================== LOGOUT ===================== */

export function logout() {
  localStorage.removeItem("token");
}