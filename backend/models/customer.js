const mongoose = require("mongoose");

// ==========================================
// PAYMENT SCHEMA
// ==========================================

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0
    },

    date: {
      type: String,
      required: true
    },

    method: {
      type: String,
      enum: [
        "Cash",
        "UPI",
        "Card",
        "Bank Transfer"
      ],
      default: "Cash"
    }
  },
  {
    timestamps: true
  }
);


// ==========================================
// CUSTOMER SCHEMA
// ==========================================

const customerSchema = new mongoose.Schema(
  {
    // ========================================
    // CUSTOMER OWNER / LOGIN USER
    // ========================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },


    // ========================================
    // CUSTOMER INFORMATION
    // ========================================

    customerName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    weddingDate: {
      type: String,
      default: ""
    },


    // ========================================
    // PAYMENT INFORMATION
    // ========================================

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    advanceAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    balanceAmount: {
      type: Number,
      default: 0,
      min: 0
    },


    // ========================================
    // SERVICES
    // ========================================

    services: {
      type: [String],
      default: []
    },


    // ========================================
    // PAYMENT HISTORY
    // ========================================

    payments: {
      type: [paymentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);


// ==========================================
// EXPORT CUSTOMER MODEL
// ==========================================

module.exports = mongoose.model(
  "Customer",
  customerSchema
);