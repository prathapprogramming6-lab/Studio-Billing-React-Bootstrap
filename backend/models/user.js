const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // Software activation
    isActivated: {
      type: Boolean,
      default: false
    },

    activationDate: {
      type: Date,
      default: null
    },

    // Free trial
    trialStartDate: {
      type: Date,
      default: null
    },

    trialEndDate: {
      type: Date,
      default: null
    },

    // Subscription
    subscriptionStatus: {
      type: String,
      enum: [
        "trial",
        "active",
        "expired",
        "inactive"
      ],
      default: "inactive"
    },

    subscriptionStartDate: {
      type: Date,
      default: null
    },

    subscriptionEndDate: {
      type: Date,
      default: null
    },

    // Current monthly subscription price
    subscriptionPrice: {
      type: Number,
      default: 99,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);