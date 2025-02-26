import { showAlert } from "./alert.js";

// type is either 'Password' or 'Data'

export const updateMe = async (data, type) => {
  try {
    const url =
      type === "Password"
        ? "/api/v1/users/updatePassword"
        : "/api/v1/users/updateMe";
    const res = await axios.patch(url, data);
    if (res.data.status === "Success") {
      showAlert("success", `${type} updated successfully`);
      setTimeout(() => {
        location.reload(); // Refresh the page after 1.5 seconds
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
