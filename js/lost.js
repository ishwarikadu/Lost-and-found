async function submitLost() {
  const itemName = document.getElementById("itemName").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();
  const keywords = document.getElementById("keywords").value.trim();
  const dateLost = document.getElementById("dateLost").value;
  const location = document.getElementById("location").value.trim();
  const image = document.getElementById("image").files[0];

  if (!itemName || !category || !dateLost || !location) {
    document.getElementById("lost_msg").innerText = "Please fill required fields";
    return;
  }

  let formData = new FormData();
  formData.append("itemName", itemName);
  formData.append("category", category);
  formData.append("description", description);
  formData.append("keywords", keywords);
  formData.append("dateLost", dateLost);
  formData.append("location", location);
  if (image) formData.append("image", image);

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/lost`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();

  if (data.message === "Lost item submitted successfully" || data.data) {
    alert("Lost Item Submitted ✅");
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("lost_msg").innerText = data.message;
  }
}