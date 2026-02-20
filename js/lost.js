const BASE_URL = "http://127.0.0.1:8000";

async function submitLost() {
  const itemName = document.getElementById("itemName").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const dateLost = document.getElementById("dateLost").value;
  const location = document.getElementById("location").value.trim();
  const imageUrl = document.getElementById("imageUrl")?.value.trim() || "";

  const msgEl = document.getElementById("lost_msg");

  // Basic validation
  if (!category || !dateLost || !location) {
    msgEl.innerText = "Please fill all required fields";
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const payload = {
    item_name: itemName || null,
    category: category,
    description: description,
    date: dateLost,
    location: location,
    image_url: imageUrl,
    status: "LOST"
  };

  try {
    const res = await fetch(`${BASE_URL}/api/reports/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      msgEl.innerText = data.message || "Failed to submit lost item";
      return;
    }

    alert("Lost item submitted successfully ✅");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    msgEl.innerText = "Server error. Please try again.";
  }
}
