const BASE_URL = "http://localhost:8000";

/* -------------------- LOGIN USER -------------------- */

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msgEl = document.getElementById("msg");

  if (!email || !password) {
    msgEl.innerText = "Please enter email & password";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: email,   // email is username
        password: password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      msgEl.innerText = data.detail || "Invalid credentials";
      return;
    }

    // Save JWT access token
    localStorage.setItem("token", data.access);

    // Optional UI-only info
    localStorage.setItem("email", email);

    // Redirect (backend will protect admin routes anyway)
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    msgEl.innerText = "Server error. Please try again.";
  }
}

/* -------------------- REGISTER USER -------------------- */

async function registerUser() {
  console.log("Register function triggered");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const prn = document.getElementById("prn").value.trim(); // kept (not sent)
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const msgEl = document.getElementById("reg_msg");

  if (!name || !email || !password || !role) {
    msgEl.innerText = "All fields are required";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role: role
      })
    });

    const data = await res.json();
    console.log("API Response:", data);

    if (res.ok) {
      alert("Registration successful ✅");
      window.location.href = "login.html";
    } else {
      msgEl.innerText = data.message || "Registration failed";
    }

  } catch (err) {
    console.error(err);
    msgEl.innerText = "Server error. Please try again.";
  }
}

/* -------------------- LOGOUT (OPTIONAL) -------------------- */

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  window.location.href = "login.html";
}
