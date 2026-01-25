async function submitFound() {
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();
  const keywords = document.getElementById("keywords").value.trim();
  const dateFound = document.getElementById("dateFound").value;
  const location = document.getElementById("location").value.trim();
  const image = document.getElementById("image").files[0];

  if (!category || !dateFound || !location) {
    document.getElementById("found_msg").innerText = "Please fill required fields";
    return;
  }

  let formData = new FormData();
  formData.append("category", category);
  formData.append("description", description);
  formData.append("keywords", keywords);
  formData.append("dateFound", dateFound);
  formData.append("location", location);
  if (image) formData.append("image", image);

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/found`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();

  if (data.message === "Found item submitted" || data.data) {
    alert("Found Item Submitted ✅");
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("found_msg").innerText = data.message;
  }
}