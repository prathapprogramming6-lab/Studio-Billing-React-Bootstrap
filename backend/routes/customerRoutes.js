const express = require("express");
const Customer = require("../models/customer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// CREATE CUSTOMER
// =====================================================
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            customerName,
            phone,
            weddingDate,
            totalAmount,
            advanceAmount,
            balanceAmount,
            services,
            payments
        } = req.body;

        if (
            !customerName ||
            !phone ||
            totalAmount === undefined ||
            totalAmount === null
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer name, phone and total amount are required"
            });
        }

        const customer =
            await Customer.create({
                // IMPORTANT:
                // Owner always comes from logged-in JWT user.
                owner: req.user.userId,

                customerName,
                phone,
                weddingDate:
                    weddingDate || "",

                totalAmount:
                    Number(totalAmount),

                advanceAmount:
                    Number(advanceAmount) || 0,

                balanceAmount:
                    Number(balanceAmount) ||
                    Math.max(
                        Number(totalAmount) -
                        Number(advanceAmount || 0),
                        0
                    ),

                services:
                    Array.isArray(services)
                        ? services
                        : [],

                payments:
                    Array.isArray(payments)
                        ? payments
                        : []
            });

        res.status(201).json({
            success: true,
            message:
                "Customer created successfully",
            customer
        });

    } catch (error) {
        console.error(
            "Create customer error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// GET ALL CUSTOMERS
// =====================================================
router.get(
    "/",
    authMiddleware,
    async (req, res) => {
        try {
            const customers =
                await Customer.find({
                    owner: req.user.userId
                }).sort({
                    createdAt: -1
                });

            res.json({
                success: true,
                customers
            });

        } catch (error) {
            console.error(
                "Get customers error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
);


// =====================================================
// GET SINGLE CUSTOMER
// =====================================================
router.get(
    "/:id",
    authMiddleware,
    async (req, res) => {
        try {
            const customer =
                await Customer.findOne({
                    _id: req.params.id,
                    owner: req.user.userId
                });

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Customer not found"
                });
            }

            res.json({
                success: true,
                customer
            });

        } catch (error) {
            console.error(
                "Get customer error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
);


// =====================================================
// UPDATE CUSTOMER
// =====================================================
router.put(
    "/:id",
    authMiddleware,
    async (req, res) => {
        try {
            const {
                customerName,
                phone,
                weddingDate,
                totalAmount,
                advanceAmount,
                balanceAmount,
                services
            } = req.body;

            // IMPORTANT:
            // We explicitly choose which fields can be updated.
            // owner cannot be changed from frontend.

            const updateData = {};

            if (customerName !== undefined) {
                updateData.customerName =
                    customerName;
            }

            if (phone !== undefined) {
                updateData.phone = phone;
            }

            if (weddingDate !== undefined) {
                updateData.weddingDate =
                    weddingDate;
            }

            if (totalAmount !== undefined) {
                updateData.totalAmount =
                    Number(totalAmount);
            }

            if (advanceAmount !== undefined) {
                updateData.advanceAmount =
                    Number(advanceAmount);
            }

            if (balanceAmount !== undefined) {
                updateData.balanceAmount =
                    Math.max(
                        Number(balanceAmount),
                        0
                    );
            }

            if (services !== undefined) {
                updateData.services =
                    Array.isArray(services)
                        ? services
                        : [];
            }

            const customer =
                await Customer.findOneAndUpdate(
                    {
                        _id: req.params.id,

                        // IMPORTANT:
                        // User can update only
                        // their own customer.
                        owner: req.user.userId
                    },
                    updateData,
                    {
                        new: true,
                        runValidators: true
                    }
                );

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Customer not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Customer updated successfully",
                customer
            });

        } catch (error) {
            console.error(
                "Update customer error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
);


// =====================================================
// DELETE CUSTOMER
// =====================================================
router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {
        try {
            const customer =
                await Customer.findOneAndDelete({
                    _id: req.params.id,

                    // IMPORTANT:
                    // Delete only own customer.
                    owner: req.user.userId
                });

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Customer not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Customer deleted successfully"
            });

        } catch (error) {
            console.error(
                "Delete customer error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
);


// =====================================================
// ADD PAYMENT
// =====================================================
router.post(
    "/:id/payments",
    authMiddleware,
    async (req, res) => {
        try {
            const {
                amount,
                date,
                method
            } = req.body;

            if (!amount || !date) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment amount and date are required"
                });
            }

            const customer =
                await Customer.findOne({
                    _id: req.params.id,

                    // IMPORTANT:
                    // Payment can be added only
                    // to own customer.
                    owner: req.user.userId
                });

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Customer not found"
                });
            }

            const paymentAmount =
                Number(amount);

            if (
                !Number.isFinite(
                    paymentAmount
                ) ||
                paymentAmount <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment amount must be greater than 0"
                });
            }

            const currentPaid =
                customer.payments.reduce(
                    (total, payment) =>
                        total +
                        Number(
                            payment.amount || 0
                        ),
                    0
                );

            const currentBalance =
                Math.max(
                    Number(
                        customer.totalAmount
                    ) - currentPaid,
                    0
                );

            if (
                paymentAmount >
                currentBalance
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment is greater than current balance"
                });
            }

            customer.payments.push({
                amount:
                    paymentAmount,

                date,

                method:
                    method || "Cash"
            });

            const totalPaid =
                currentPaid +
                paymentAmount;

            customer.advanceAmount =
                totalPaid;

            customer.balanceAmount =
                Math.max(
                    Number(
                        customer.totalAmount
                    ) - totalPaid,
                    0
                );

            await customer.save();

            res.json({
                success: true,
                message:
                    "Payment added successfully",
                customer
            });

        } catch (error) {
            console.error(
                "Add payment error:",
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