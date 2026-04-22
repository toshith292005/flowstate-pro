const router = require("express").Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.post("/create-subscription", verifyToken, async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_demo',
    });

    const options = {
      amount: 999 * 100, // 999 INR
      currency: "INR",
      receipt: `receipt_order_${req.user.id}`,
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_demo')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment successful, update user
      const user = await User.findById(req.user.id);
      user.isPremium = true;
      user.premiumExpiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // 1 year expiry
      user.razorpayCustomerId = razorpay_payment_id;
      await user.save();

      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
