const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");

// ===============================
// Switch Forms
// ===============================

function showLogin() {
    loginForm.style.display = "flex";
    registerForm.style.display = "none";

    loginBtn.classList.add("active");
    registerBtn.classList.remove("active");
}

function showRegister() {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";

    registerBtn.classList.add("active");
    loginBtn.classList.remove("active");
}

loginBtn.onclick = showLogin;
registerBtn.onclick = showRegister;

goRegister.onclick = showRegister;
goLogin.onclick = showLogin;

// ===============================
// Register User
// ===============================

registerForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim().toLowerCase();

    const username = document.getElementById("username").value.trim();

    const password = document.getElementById("password").value;

    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) {

        alert("Passwords do not match.");

        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(user => user.email === email);

    if (exists) {

        alert("Account already exists.");

        return;
    }

    users.push({

        name,
        email,
        username,
        password

    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration Successful!");

    registerForm.reset();

    showLogin();

});

// ===============================
// Login
// ===============================

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(

        u => u.email === email && u.password === password

    );

    if (!user) {

        alert("Invalid Email or Password");

        return;

    }

    // Save Logged User

    localStorage.setItem("currentUser", JSON.stringify(user));

    alert("Login Successful!");

    window.location.href = "index.html";

});
