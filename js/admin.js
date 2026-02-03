const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Prevent non-admin access
if (role !== "admin") {
  alert("Access denied! Only admin can view this page.");
  window.location.href = "login.html";
}

// Load Matched Items
async function loadMatches() {
  const res = await fetch(`${BASE_URL}/api/admin/matches/`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const data = await res.json();
  const body = document.getElementById("matchBody");
  body.innerHTML = "";

  if (data.length === 0) {
    body.innerHTML = `<tr><td colspan="9" class="text-center">✅ No matched items pending approval</td></tr>`;
    return;
  }

  data.forEach(item => {
    const lost = item.matchedWith;
    const student = lost?.user || {};

    body.innerHTML += `
      <tr>
        <td><a href="#" onclick="showImage('${lost.image}')">View</a></td>
        <td><a href="#" onclick="showImage('${item.image}')">View</a></td>

        <td>${item.category}</td>
        <td>${item.location}</td>
        <td><span class="badge bg-success">${item.matchScore}</span></td>

        <td>${student.name || "Unknown"}</td>
        <td>${student.email || "Unknown"}</td>

        <td>${item.dateFound?.substring(0,10) || "N/A"}</td>

        <td>
          <button class="btn btn-success btn-sm" onclick="approve('${item._id}')">
            ✅ Approve & Return
          </button>
        </td>
      </tr>
    `;
  });
}

// Load UNMATCHED Lost + Found Items
async function loadUnmatched() {
  const res = await fetch(`${BASE_URL}/api/admin/unmatched/`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const data = await res.json();
  const body = document.getElementById("unmatchedBody");
  body.innerHTML = "";

  const { lost, found } = data;

  if (lost.length === 0 && found.length === 0) {
    body.innerHTML = `<tr><td colspan="6" class="text-center">✅ No unmatched items</td></tr>`;
    return;
  }

  // LOST ITEMS
  lost.forEach(item => {
    body.innerHTML += `
      <tr>
        <td><span class="badge bg-warning">Lost</span></td>
        <td><a href="#" onclick="showImage('${item.image}')">View</a></td>
        <td>${item.category}</td>
        <td>${item.location}</td>
        <td>${item.dateLost?.substring(0,10) || "N/A"}</td>
        <td>${item.user?.name || "Unknown"}<br>${item.user?.email || ""}</td>
      </tr>
    `;
  });

  // FOUND ITEMS
  found.forEach(item => {
    body.innerHTML += `
      <tr>
        <td><span class="badge bg-info">Found</span></td>
        <td><a href="#" onclick="showImage('${item.image}')">View</a></td>
        <td>${item.category}</td>
        <td>${item.location}</td>
        <td>${item.dateFound?.substring(0,10) || "N/A"}</td>
        <td>${item.user?.name || "Unknown"}<br>${item.user?.email || ""}</td>
      </tr>
    `;
  });
}

// Popup image
function showImage(filename) {
  document.getElementById("popupImage").src = `http://localhost:8000/uploads/${filename}`;
  new bootstrap.Modal(document.getElementById("imageModal")).show();
}

// Approve Item & Delete
async function approve(foundId) {
  if (!confirm("Confirm return approval?")) return;

  const res = await fetch(`${BASE_URL}/api/admin/approve/${foundId}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` }
  });

  const data = await res.json();
  alert(data.message);

  loadMatches();
  loadUnmatched();
}

// Load all on page load
loadMatches();
loadUnmatched();