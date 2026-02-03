const BASE_URL = "http://127.0.0.1:8000";

async function submitFound() {
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const dateFound = document.getElementById("dateFound").value;
  const location = document.getElementById("location").value.trim();
  const imageUrl = document.getElementById("imageUrl")?.value.trim() || "";

  const msgEl = document.getElementById("found_msg");

  // Basic validation
  if (!category || !dateFound || !location) {
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
    item_name: null,               // optional for found items
    category: category,
    description: description,
    date: dateFound,
    location: location,
    image_url: imageUrl,
    status: "FOUND"
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
      msgEl.innerText = data.message || "Failed to submit found item";
      return;
    }

    alert("Found item submitted successfully ✅");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    msgEl.innerText = "Server error. Please try again.";
  }
}
