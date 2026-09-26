const mongoose = require("mongoose");

const subscriptionSettingsSchema =
  new mongoose.Schema(
    {
      monthlyPrice: {
        type: Number,
        default: 99,
        min: 0
      },

      trialHours: {
        type: Number,
        default: 24,
        min: 0
      },

      subscriptionDays: {
        type: Number,
        default: 30,
        min: 1
      }
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "SubscriptionSettings",
    subscriptionSettingsSchema
  );