const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const SubscriptionSettings = require("../models/subscriptionSettings");

const router = express.Router();


// =====================================================
// REGISTER
// =====================================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,

      isActivated: false,
      activationDate: null,

      trialStartDate: null,
      trialEndDate: null,

      subscriptionStatus: "inactive",

      subscriptionStartDate: null,
      subscriptionEndDate: null,

      subscriptionPrice: 99
    });

    const adminEmail = (
      process.env.ADMIN_EMAIL || ""
    ).toLowerCase().trim();

    const isAdmin =
      normalizedEmail === adminEmail;

    res.status(201).json({
      success: true,

      message:
        "Account created successfully. Please activate the software to start your free trial.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,

        isActivated: user.isActivated,

        isAdmin: isAdmin,

        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,

        subscriptionStatus:
          user.subscriptionStatus,

        subscriptionPrice:
          user.subscriptionPrice
      }
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required"
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }


    // =================================================
    // CHECK TRIAL EXPIRY
    // =================================================

    const now = new Date();

    if (
      user.subscriptionStatus === "trial" &&
      user.trialEndDate &&
      now > user.trialEndDate
    ) {
      user.subscriptionStatus = "expired";

      await user.save();
    }


    // =================================================
    // CHECK PAID SUBSCRIPTION EXPIRY
    // =================================================

    if (
      user.subscriptionStatus === "active" &&
      user.subscriptionEndDate &&
      now > user.subscriptionEndDate
    ) {
      user.subscriptionStatus = "expired";

      await user.save();
    }


    // =================================================
    // CHECK ADMIN
    // =================================================

    const adminEmail = (
      process.env.ADMIN_EMAIL || ""
    ).toLowerCase().trim();

    const isAdmin =
      normalizedEmail === adminEmail;


    // =================================================
    // CREATE JWT TOKEN
    // =================================================

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );


    // =================================================
    // RESPONSE
    // =================================================

    res.json({
      success: true,

      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,

        isActivated:
          user.isActivated === true,

        isAdmin: isAdmin,

        activationDate:
          user.activationDate,

        trialStartDate:
          user.trialStartDate,

        trialEndDate:
          user.trialEndDate,

        subscriptionStatus:
          user.subscriptionStatus,

        subscriptionStartDate:
          user.subscriptionStartDate,

        subscriptionEndDate:
          user.subscriptionEndDate,

        subscriptionPrice:
          user.subscriptionPrice
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =====================================================
// ACTIVATE SOFTWARE
// =====================================================

router.post("/activate", async (req, res) => {
  try {
    const { email, activationKey } = req.body;

    if (!email || !activationKey) {
      return res.status(400).json({
        success: false,
        message:
          "Email and activation key are required"
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }


    // =================================================
    // ALREADY ACTIVATED
    // =================================================

    if (user.isActivated === true) {

      const adminEmail = (
        process.env.ADMIN_EMAIL || ""
      ).toLowerCase().trim();

      const isAdmin =
        normalizedEmail === adminEmail;

      return res.json({
        success: true,

        message:
          "Software is already activated",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,

          isActivated: true,

          isAdmin: isAdmin,

          activationDate:
            user.activationDate,

          trialStartDate:
            user.trialStartDate,

          trialEndDate:
            user.trialEndDate,

          subscriptionStatus:
            user.subscriptionStatus,

          subscriptionPrice:
            user.subscriptionPrice
        }
      });
    }


    // =================================================
    // CHECK MASTER ACTIVATION KEY
    // =================================================

    if (
      activationKey.trim() !==
      process.env.MASTER_ACTIVATION_KEY
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid activation key"
      });
    }


    // =================================================
    // GET SUBSCRIPTION SETTINGS
    // =================================================

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


    // =================================================
    // START TRIAL FROM ACTIVATION TIME
    // =================================================

    const activationDate = new Date();

    const trialStartDate =
      activationDate;

    const trialEndDate = new Date(
      activationDate.getTime() +
      settings.trialHours *
      60 *
      60 *
      1000
    );


    // =================================================
    // UPDATE USER
    // =================================================

    user.isActivated = true;

    user.activationDate =
      activationDate;

    user.trialStartDate =
      trialStartDate;

    user.trialEndDate =
      trialEndDate;

    user.subscriptionStatus =
      "trial";

    user.subscriptionStartDate =
      null;

    user.subscriptionEndDate =
      null;

    user.subscriptionPrice =
      settings.monthlyPrice;

    await user.save();


    // =================================================
    // CHECK ADMIN
    // =================================================

    const adminEmail = (
      process.env.ADMIN_EMAIL || ""
    ).toLowerCase().trim();

    const isAdmin =
      normalizedEmail === adminEmail;


    // =================================================
    // RESPONSE
    // =================================================

    res.json({
      success: true,

      message:
        "Software activated successfully. Your free trial has started.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,

        isActivated: true,

        isAdmin: isAdmin,

        activationDate:
          user.activationDate,

        trialStartDate:
          user.trialStartDate,

        trialEndDate:
          user.trialEndDate,

        subscriptionStatus:
          user.subscriptionStatus,

        subscriptionPrice:
          user.subscriptionPrice
      }
    });

  } catch (error) {
    console.error(
      "Activation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


module.exports = router;