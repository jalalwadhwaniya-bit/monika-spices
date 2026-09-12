window.MONIKA_PAY = {
  merchantName: "Monika Spices",
  // Paste your Razorpay Key ID to accept live debit/credit cards, UPI and QR.
  // Dashboard: https://dashboard.razorpay.com  →  rzp_test_xxx or rzp_live_xxx
  razorpayKeyId: "",
  // Your shop UPI ID for Scan QR / UPI collect, e.g. 8390143708@paytm
  upiId: "",
  coupons: [
    { code: "MONIKA10", percent: 10, maxDiscount: 200, label: "10% off" },
    { code: "FIRST50", amount: 50, minSubtotal: 200, label: "₹50 off" },
    { code: "SPICE100", amount: 100, minSubtotal: 500, label: "₹100 off" },
  ],
  shipping: {
    indiaFreeFrom: 1000,
    indiaPerKg: 50,
    intlPerKg: 1000,
  },
  // Shop licence numbers shown on Contact and in the footer.
  fssai: "",
  gstin: "",
};
