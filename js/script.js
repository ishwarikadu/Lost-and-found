// Redirect to login if token missing
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role"); // optional cleanup
  window.location.href = "login.html";
}

function goToLost() {
  window.location.href = "lost.html";
}

function goToFound() {
  window.location.href = "found.html";
}

function goToReports() {
  const role = localStorage.getItem("role");

  if (role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "history.html";
  }
}


