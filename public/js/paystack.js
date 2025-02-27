import { showAlert } from "./alert.js";

export const bookTour = async (tourId) => {
  try {
    const res = await axios.get(`/api/v1/booking/checkout-session/${tourId}`);

    // ✅ Extract the checkout URL from the response
    const checkoutUrl = res.data.checkoutUrl;

    if (checkoutUrl) {
      // ✅ Redirect the user to Paystack Checkout
      window.location.href = checkoutUrl;
    } else {
      showAlert(
        "error",
        "Payment initiation failed. No checkout URL received."
      );
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.message);
  }
};

async function verifyPayment() {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("reference");

  if (!reference) {
    document.getElementById("statusTitle").innerText = "❌ Payment Failed";
    document.getElementById("statusMessage").innerText =
      "Missing payment reference.";
    return;
  }

  try {
    const response = await axios.get(
      `/api/v1/booking/payment-success?reference=${reference}`
    );

    if (response.data.status === "success") {
      document.getElementById("statusTitle").innerText =
        "🎉 Payment Successful!";
      document.getElementById("statusTitle").classList.add("text-green-600");
      document.getElementById(
        "statusMessage"
      ).innerText = `Reference: ${response.data.reference}`;
    } else {
      document.getElementById("statusTitle").innerText = "❌ Payment Failed";
      document.getElementById("statusTitle").classList.add("text-red-600");
      document.getElementById("statusMessage").innerText =
        response.data.message || "Something went wrong.";
    }
  } catch (error) {
    document.getElementById("statusTitle").innerText = "❌ Payment Failed";
    document.getElementById("statusTitle").classList.add("text-red-600");
    document.getElementById("statusMessage").innerText =
      "Could not verify payment. Please try again.";
  }
}

verifyPayment();
