const express = require("express");
const SubscriptionSettings = require("../models/subscriptionSettings");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// GET SUBSCRIPTION SETTINGS
// Public - used to display current subscription price
// --------------------------------------------------
router.get("/settings", async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      settings: {
        monthlyPrice:
          settings.monthlyPrice,

        trialHours:
          settings.trialHours,

        subscriptionDays:
          settings.subscriptionDays
      }
    });
  } catch (error) {
    console.error(
      "Get subscription settings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// --------------------------------------------------
// UPDATE SUBSCRIPTION SETTINGS
// ADMIN ONLY
// --------------------------------------------------
router.put(
  "/settings",
  authMiddleware,
  async (req, res) => {
    try {
      // Check Admin
      if (req.user.isAdmin !== true) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required"
        });
      }

      const {
        monthlyPrice,
        trialHours,
        subscriptionDays
      } = req.body;

      if (
        monthlyPrice === undefined ||
        trialHours === undefined ||
        subscriptionDays === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All subscription settings are required"
        });
      }

      const price =
        Number(monthlyPrice);

      const hours =
        Number(trialHours);

      const days =
        Number(subscriptionDays);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(hours) ||
        !Number.isFinite(days)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Subscription values must be numbers"
        });
      }

      if (
        price < 0 ||
        hours < 0 ||
        days <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid subscription settings"
        });
      }

      let settings =
        await SubscriptionSettings.findOne();

      if (!settings) {
        settings =
          new SubscriptionSettings();
      }

      settings.monthlyPrice = price;
      settings.trialHours = hours;
      settings.subscriptionDays = days;

      await settings.save();

      res.status(200).json({
        success: true,
        message:
          "Subscription settings updated successfully",

        settings: {
          monthlyPrice:
            settings.monthlyPrice,

          trialHours:
            settings.trialHours,

          subscriptionDays:
            settings.subscriptionDays
        }
      });
    } catch (error) {
      console.error(
        "Update subscription settings error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);

module.exports = router;