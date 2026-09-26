const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function authMiddleware(req, res, next) {
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

    // =================================================
    // ADMIN CHECK
    // =================================================

    const adminEmail = (
      process.env.ADMIN_EMAIL || ""
    ).toLowerCase().trim();

    const userEmail = (
      user.email || ""
    ).toLowerCase().trim();

    const isAdmin =
      userEmail === adminEmail;


    // =================================================
    // SOFTWARE ACTIVATION CHECK
    // =================================================

    if (user.isActivated !== true) {
      return res.status(403).json({
        success: false,
        message: "Software activation required",
        code: "SOFTWARE_NOT_ACTIVATED"
      });
    }


    // =================================================
    // ADMIN BYPASS
    // =================================================
    // Admin accountக்கு subscription expiry
    // மற்றும் subscription status restriction இல்லை.

    if (isAdmin) {

      req.user = {

        userId: user._id,

        email: user.email,

        name: user.name,

        isActivated:
          user.isActivated,

        isAdmin: true,

        subscriptionStatus:
          user.subscriptionStatus,

        trialStartDate:
          user.trialStartDate,

        trialEndDate:
          user.trialEndDate,

        subscriptionStartDate:
          user.subscriptionStartDate,

        subscriptionEndDate:
          user.subscriptionEndDate
      };

      return next();
    }


    // =================================================
    // NORMAL USER SUBSCRIPTION CHECK
    // =================================================

    const now = new Date();


    // =================================================
    // TRIAL EXPIRY CHECK
    // =================================================

    if (
      user.subscriptionStatus === "trial" &&
      user.trialEndDate
    ) {

      if (now >= user.trialEndDate) {

        user.subscriptionStatus =
          "expired";

        await user.save();

        return res.status(403).json({
          success: false,
          message:
            "Your free trial has expired. Please subscribe to continue.",
          code: "SUBSCRIPTION_EXPIRED"
        });
      }
    }


    // =================================================
    // PAID SUBSCRIPTION EXPIRY CHECK
    // =================================================

    if (
      user.subscriptionStatus === "active" &&
      user.subscriptionEndDate
    ) {

      if (now >= user.subscriptionEndDate) {

        user.subscriptionStatus =
          "expired";

        await user.save();

        return res.status(403).json({
          success: false,
          message:
            "Your subscription has expired. Please renew to continue.",
          code: "SUBSCRIPTION_EXPIRED"
        });
      }
    }


    // =================================================
    // SUBSCRIPTION STATUS CHECK
    // =================================================

    if (
      user.subscriptionStatus !== "trial" &&
      user.subscriptionStatus !== "active"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Your free trial or subscription has expired.",
        code: "SUBSCRIPTION_EXPIRED"
      });
    }


    // =================================================
    // NORMAL USER REQUEST
    // =================================================

    req.user = {

      userId: user._id,

      email: user.email,

      name: user.name,

      isActivated:
        user.isActivated,

      isAdmin: false,

      subscriptionStatus:
        user.subscriptionStatus,

      trialStartDate:
        user.trialStartDate,

      trialEndDate:
        user.trialEndDate,

      subscriptionStartDate:
        user.subscriptionStartDate,

      subscriptionEndDate:
        user.subscriptionEndDate
    };


    next();

  } catch (error) {

    console.error(
      "Auth middleware error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token"
    });
  }
}


module.exports = authMiddleware;