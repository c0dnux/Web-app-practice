const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModels");
const AppError = require("../utils/appError");
const Booking = require("../models/bookingModel");
const axios = require("axios");
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  const reference = `tour_${req.user.id}_${Date.now()}_${Math.floor(
    Math.random() * 100000
  )}`;
  // 2) Create checkout session

  const paystackResponse = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: req.user.email,
      amount: tour.price * 100, // Convert to kobo (Naira subunit)
      currency: "NGN",
      reference,
      callback_url: `${req.protocol}://${req.get(
        "host"
      )}/payment-success?reference=${reference}`,

      metadata: {
        user: req.user._id,
        tour: tour.id,
        amount: tour.price * 100, // Convert to kobo (Naira subunit)
        currency: "NGN",
        quantity: 1,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  // 3) Create session as response
  res.status(200).json({
    status: "success",

    checkoutUrl: paystackResponse.data.data.authorization_url, // Redirect user here
  });
});

exports.paymentSuccess = catchAsync(async (req, res, next) => {
  const { reference } = req.query; // Get reference from the query string
  if (!reference) {
    return next(new AppError(`/payment-failed?error=Missing reference`, 404));
  }
  const existingBooking = await Booking.findOne({ reference });
  if (existingBooking) {
    return next(new AppError(`Payment already recorded`, 200));
  }
  // 🔹 Verify the transaction with Paystack
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (response.data.data.status === "success") {
    const { metadata, reference, paid_at } = response.data.data;
    console.log(paid_at);

    // ✅ Payment is successful, save booking in the database
    await Booking.create({
      tour: metadata.tour,
      user: metadata.user,
      price: metadata.amount / 100, // Convert back to Naira
      reference,
      createdAt: paid_at, // Save payment time
    });

    // Redirect to a success page on the frontend
    // return res.redirect(`/payment-confirmed?reference=${reference}`);

    return res.status(200).json({
      status: "success",
      message: "Payment successful",
      reference,
      createdAt: paid_at,
    });
  } else {
    // ❌ Payment failed - Redirect to an error page
    // return res.redirect(`/payment-failed?error=Payment verification failed`);
    res.status(400).json({
      status: "failed",
      message: "Payment verification failed",
    });
  }
});
