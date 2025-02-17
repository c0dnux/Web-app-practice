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
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
