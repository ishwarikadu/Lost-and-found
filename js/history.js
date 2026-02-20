const BASE_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("token");

/* -------------------- Helpers -------------------- */

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return dateStr.substring(0, 10);
}

function statusBadge(status) {
  if (status === "RETURNED") return "success";
  if (status === "FOUND") return "info";
  return "warning"; // LOST
}

/* -------------------- Load LOST items -------------------- */

async function loadLost() {
  const res = await fetch(
    `${BASE_URL}/api/reports/?status=LOST`,
    { headers: authHeaders() }
  );

  const json = await res.json();
  const body = document.getElementById("lostBody");
  body.innerHTML = "";

  if (!json.success) {
    body.innerHTML = `<tr><td colspan="5">Failed to load lost items</td></tr>`;
    return;
  }

  json.data.forEach(item => {
    body.innerHTML += `
      <tr>
        <td>
          ${item.image_url
            ? `<a href="${item.image_url}" target="_blank">View</a>`
            : "N/A"}
        </td>
        <td>${item.category}</td>
        <td>${item.location}</td>
        <td>${formatDate(item.date)}</td>
        <td>
          <span class="badge bg-${statusBadge(item.status)}">
            ${item.status}
          </span>
        </td>
      </tr>
    `;
  });
}

/* -------------------- Load FOUND items -------------------- */

async function loadFound() {
  const res = await fetch(
    `${BASE_URL}/api/reports/?status=FOUND`,
    { headers: authHeaders() }
  );

  const json = await res.json();
  const body = document.getElementById("foundBody");
  body.innerHTML = "";

  if (!json.success) {
    body.innerHTML = `<tr><td colspan="5">Failed to load found items</td></tr>`;
    return;
  }

  json.data.forEach(item => {
    body.innerHTML += `
      <tr>
        <td>
          ${item.image_url
            ? `<a href="${item.image_url}" target="_blank">View</a>`
            : "N/A"}
        </td>
        <td>${item.category}</td>
        <td>${item.location}</td>
        <td>${formatDate(item.date)}</td>
        <td>
          <span class="badge bg-${item.is_matched ? "success" : "warning"}">
            ${item.is_matched ? "Matched" : "Pending"}
          </span>
        </td>
      </tr>
    `;
  });
}

/* -------------------- Init -------------------- */

if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
} else {
  loadLost();
  loadFound();
}
