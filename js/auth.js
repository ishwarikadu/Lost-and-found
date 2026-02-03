const BASE_URL = "http://localhost:8000";


//login user
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    document.getElementById("msg").innerText = "Please enter email & password";
    return;
  }

  const res = await fetch(`${BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    // save token
    localStorage.setItem("name", data.user.name);
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    // redirect based on role
    if (data.user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } else {
    document.getElementById("msg").innerText = data.message;
  }
}

//register user

async function registerUser() {
  console.log("Register function triggered"); // debug

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const prn = document.getElementById("prn").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!name || !email || !prn || !password) {
    document.getElementById("reg_msg").innerText = "All fields are required";
    return;
  }

  const res = await fetch(`${BASE_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, prn, password, role })
  });

  const data = await res.json();
  console.log("API Response:", data);

  if (data.message === "User registered successfully") {
    alert("Registration successful ✅");
    window.location.href = "login.html";
  } else {
    document.getElementById("reg_msg").innerText = data.message;
  }
}