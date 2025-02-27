import { login, logout } from "./login.js";
import { displayMap } from "./mapbox.js";
import { updateMe } from "./updateSettings.js";
import { bookTour } from "./paystack.js";
//DOM ELEMENTS
const map = document.getElementById("map");
const input2 = document.getElementById("password-confirm");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPassword = document.querySelector(".form-user-settings");
const checkout= document.querySelector("#book-tour");
// if (input2) {
//   input2.addEventListener("input", function () {
//     // Get the values of both input fields
//     const input2 = document.getElementById("password").value;
//     const input1 = document.getElementById("password-confirm").value;

//     // Get the message display element
//     var messageElement = document.getElementById("message");

//     // Check if the values match
//     if (input2 !== input1) {
//       messageElement.style.display = "block";
//       messageElement.classList.add("alert", "alert-danger");
//       messageElement.textContent = "Values do not match.";
//     } else {
//       messageElement.style.display = "none"; // Hides the element
//     }
//   });
// }
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
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    console.log(form);

    await updateMe(form, "Data");
  });
}
if (userPassword) {
  userPassword.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save--password").textContent = "Updating...";
    const currentPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;

    await updateMe({ currentPassword, newPassword }, "Password");
    document.querySelector(".btn--save--password").textContent =
      "Save password";

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
  });
}
if(checkout){
  checkout.addEventListener("click", async (e) => {
    e.target.textContent = "Processing...";
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
  });
}