const express = require("express");
const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const SubscriptionSettings = require("../models/subscriptionSettings");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/*
====================================================
AUTHENTICATE USER
====================================================
Important:
Expired users are allowed here because they need
access to the payment page to renew subscription.
*/
async function paymentAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found"
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Payment authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session"
    });
  }
}

/*
====================================================
CREATE RAZORPAY ORDER
====================================================
*/
router.post(
  "/create-order",
  paymentAuth,
  async (req, res) => {
    try {
      const user = req.user;

      if (user.isActivated !== true) {
        return res.status(403).json({
          success: false,
          message:
            "Please activate the software before subscribing."
        });
      }

      let settings =
        await SubscriptionSettings.findOne();

      if (!settings) {
        settings =
          await SubscriptionSettings.create({
            monthlyPrice: 99,
            trialHours: 24,
            subscriptionDays: 30
          });
      }

      const amountInRupees =
        Number(settings.monthlyPrice);

      if (
        !Number.isFinite(amountInRupees) ||
        amountInRupees <= 0
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Invalid subscription price"
        });
      }

      /*
      Razorpay amount must be sent in paise.

      ₹99 = 9900 paise
      */
      const amountInPaise =
        Math.round(
          amountInRupees * 100
        );

      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt:
          `studio_${user._id}_${Date.now()}`,
        notes: {
          userId: user._id.toString(),
          purpose:
            "Studio Billing Monthly Subscription"
        }
      };

      const order =
        await razorpay.orders.create(
          options
        );

      res.status(200).json({
        success: true,
        message:
          "Payment order created successfully",
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency
        },
        subscription: {
          price: amountInRupees,
          days:
            settings.subscriptionDays
        },
        razorpayKey:
          process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      console.error(
        "Create payment order error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to create payment order"
      });
    }
  }
);

/*
====================================================
VERIFY RAZORPAY PAYMENT
====================================================
*/
router.post(
  "/verify",
  paymentAuth,
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment verification details are missing"
        });
      }

      /*
      Create expected Razorpay signature.
      */
      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      /*
      Compare Razorpay signature
      with our generated signature.
      */
      const signatureMatches =
        crypto.timingSafeEqual(
          Buffer.from(
            generatedSignature,
            "utf8"
          ),
          Buffer.from(
            razorpay_signature,
            "utf8"
          )
        );

      if (!signatureMatches) {
        return res.status(400).json({
          success: false,
          message:
            "Payment verification failed"
        });
      }

      const user = req.user;

      let settings =
        await SubscriptionSettings.findOne();

      if (!settings) {
        settings =
          await SubscriptionSettings.create({
            monthlyPrice: 99,
            trialHours: 24,
            subscriptionDays: 30
          });
      }

      const now = new Date();

      const subscriptionEndDate =
        new Date(now);

      subscriptionEndDate.setDate(
        subscriptionEndDate.getDate() +
          Number(
            settings.subscriptionDays
          )
      );

      /*
      Activate subscription automatically.
      */
      user.subscriptionStatus =
        "active";

      user.subscriptionStartDate =
        now;

      user.subscriptionEndDate =
        subscriptionEndDate;

      user.subscriptionPrice =
        Number(settings.monthlyPrice);

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Payment successful. Your subscription is now active.",
        payment: {
          orderId:
            razorpay_order_id,
          paymentId:
            razorpay_payment_id
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isActivated:
            user.isActivated,
          subscriptionStatus:
            user.subscriptionStatus,
          subscriptionPrice:
            user.subscriptionPrice,
          subscriptionStartDate:
            user.subscriptionStartDate,
          subscriptionEndDate:
            user.subscriptionEndDate
        }
      });
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to verify payment"
      });
    }
  }
);

module.exports = router;