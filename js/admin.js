const BASE_URL = "http://127.0.0.1:8000";

/* -------------------- Helpers -------------------- */

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Authorization": `Bearer ${token}`
  };
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return dateStr.substring(0, 10);
}

/* -------------------- Auth Guard -------------------- */

function requireAuth() {
  const token = getToken();
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
  }
}

/* -------------------- Load PENDING Matches -------------------- */

async function loadPendingMatches() {
  const body = document.getElementById("matchBody");
  body.innerHTML = "";

  try {
    const res = await fetch(
      `${BASE_URL}/api/matches/pending/`,
      { headers: authHeaders() }
    );

    if (res.status === 401) {
      requireAuth();
      return;
    }

    const json = await res.json();

    if (!res.ok || !json.success) {
      body.innerHTML = `<tr><td colspan="8">Failed to load pending matches</td></tr>`;
      return;
    }

    if (json.data.length === 0) {
      body.innerHTML = `<tr><td colspan="8">✅ No pending matches</td></tr>`;
      return;
    }

    json.data.forEach(match => {
      const lost = match.lost_report;
      const found = match.found_report;

      body.innerHTML += `
        <tr>
          <td>${lost.image_url ? `<a href="${lost.image_url}" target="_blank">View</a>` : "N/A"}</td>
          <td>${found.image_url ? `<a href="${found.image_url}" target="_blank">View</a>` : "N/A"}</td>
          <td>${lost.category}</td>
          <td>${lost.location}</td>
          <td><span class="badge bg-info">${match.match_score}</span></td>
          <td>${formatDate(match.created_at)}</td>
          <td>
            <button class="btn btn-success btn-sm" onclick="approveMatch(${match.id})">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectMatch(${match.id})">Reject</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error(err);
    body.innerHTML = `<tr><td colspan="8">Server error</td></tr>`;
  }
}

/* -------------------- Load UNMATCHED Reports -------------------- */

async function loadUnmatchedReports() {
  const body = document.getElementById("unmatchedBody");
  body.innerHTML = "";

  try {
    const res = await fetch(
      `${BASE_URL}/api/reports/unmatched/`,
      { headers: authHeaders() }
    );

    if (res.status === 401) {
      requireAuth();
      return;
    }

    const json = await res.json();

    if (!res.ok || !json.success) {
      body.innerHTML = `<tr><td colspan="6">Failed to load unmatched reports</td></tr>`;
      return;
    }

    if (json.data.length === 0) {
      body.innerHTML = `<tr><td colspan="6">✅ No unmatched reports</td></tr>`;
      return;
    }

    json.data.forEach(item => {
      body.innerHTML += `
        <tr>
          <td>${item.image_url ? `<a href="${item.image_url}" target="_blank">View</a>` : "N/A"}</td>
          <td>${item.category}</td>
          <td>${item.location}</td>
          <td>${formatDate(item.date)}</td>
          <td><span class="badge bg-warning">${item.status}</span></td>
        </tr>
      `;
    });

  } catch (err) {
    console.error(err);
    body.innerHTML = `<tr><td colspan="6">Server error</td></tr>`;
  }
}

/* -------------------- Approve / Reject -------------------- */

async function approveMatch(matchId) {
  if (!confirm("Approve this match and mark items as returned?")) return;

  const res = await fetch(
    `${BASE_URL}/api/matches/${matchId}/approve/`,
    { method: "PATCH", headers: authHeaders() }
  );

  if (res.status === 401) {
    requireAuth();
    return;
  }

  const json = await res.json();
  alert(json.message || "Approved");

  loadPendingMatches();
  loadUnmatchedReports();
}

async function rejectMatch(matchId) {
  if (!confirm("Reject this match?")) return;

  const res = await fetch(
    `${BASE_URL}/api/matches/${matchId}/reject/`,
    { method: "PATCH", headers: authHeaders() }
  );

  if (res.status === 401) {
    requireAuth();
    return;
  }

  const json = await res.json();
  alert(json.message || "Rejected");

  loadPendingMatches();
}

/* -------------------- Init -------------------- */

requireAuth();
loadPendingMatches();
loadUnmatchedReports();
