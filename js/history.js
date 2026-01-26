const token = localStorage.getItem("token");

// Load Lost Items
async function loadLost() {
  const res = await fetch(`${BASE_URL}/api/lost/my`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const data = await res.json();
  const body = document.getElementById("lostBody");
  body.innerHTML = "";

  data.forEach(item => {
    body.innerHTML += `
      <tr>
        <td><a href="#" onclick="showImage('${item.image}')">View</a></td>
        <td>${item.category}</td>
        <td>${item.location}</td>
        <td>${item.dateLost?.substring(0,10) || "N/A"}</td>
        <td><span class="badge bg-${item.status === 'returned' ? 'success' : 'warning'}">${item.status}</span></td>
      </tr>
    `;
  });
}

// Load Found Items
async function loadFound() {
  const res = await fetch(`${BASE_URL}/api/found/my`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const data = await res.json();
  const body = document.getElementById("foundBody");
  body.innerHTML = "";

  data.forEach(item => {
    body.innerHTML += `
      <tr>
        <td><a href="#" onclick="showImage('${item.image}')">View</a></td>
        <td>${item.category}</td>
        <td>${item.location}</td>
        <td>${item.dateFound?.substring(0,10) || "N/A"}</td>
        <td><span class="badge bg-${item.matchedWith ? 'info' : 'warning'}">${item.matchedWith ? 'Matched' : 'Pending'}</span></td>
      </tr>
    `;
  });
}

loadLost();
loadFound();