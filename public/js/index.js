import { login, logout } from "./login.js";
import { displayMap } from "./mapbox.js";
import { updateMe } from "./updateSettings.js";
//DOM ELEMENTS
const map = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPassword = document.querySelector(".form-user-settings");
//VALUES
//DELEGATION
if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await login(email, password);
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await logout();
  });
}
if (userDataForm) {
  userDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    await updateMe({ name, email }, "Data");
  });
}
if (userPassword) {
  userPassword.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;

    await updateMe({ currentPassword, newPassword }, "Password");
  });
}
