// controllers/appealController.js
const Appeal     = require("../models/Appeal");
const Vendor     = require("../models/Vendor");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection failed:", err.message);
  } else {
    console.log("✅ SMTP ready to send emails");
  }
});

// POST /api/appeals
const submitAppeal = async (req, res) => {
  try {
    const { vendorId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Appeal message is required." });
    }

    const vendor = await Vendor.findById(vendorId).select("status businessName email");
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (vendor.status !== "suspended") {
      return res.status(400).json({ message: "Only suspended vendors can submit appeals." });
    }

    const existing = await Appeal.findOne({ vendor: vendorId, status: "pending" });
    if (existing) {
      return res.status(409).json({
        message: "You already have a pending appeal. We will be in touch soon.",
      });
    }

    const appeal = await Appeal.create({ vendor: vendorId, message: message.trim() });

    // Email admin
    try {
      await transporter.sendMail({
        from:    `"KuduDash" <${process.env.SMTP_USER}>`,
        to:      process.env.ADMIN_EMAIL,
        subject: `New suspension appeal — ${vendor.businessName}`,
        text:    `Vendor: ${vendor.businessName} (${vendorId})\n\nMessage:\n${message.trim()}`,
      });
    } catch (err) {
      console.error("❌ Admin email failed:", err.message);
    }

    // Confirmation email to vendor
    if (vendor.email) {
      try {
        await transporter.sendMail({
          from:    `"KuduDash" <${process.env.SMTP_USER}>`,
          to:      vendor.email,
          subject: "We received your appeal",
          text:    `Hi ${vendor.businessName},\n\nThank you for submitting an appeal. Our team will review it and get back to you as soon as possible.\n\nYour message:\n"${message.trim()}"\n\n— KuduDash Support`,
        });
      } catch (err) {
        console.error("❌ Vendor email failed:", err.message);
      }
    }

    res.status(201).json({ message: "Appeal submitted successfully.", appealId: appeal._id });

  } catch (err) {
    console.error("submitAppeal error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appeals  (admin only)
const getAllAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find()
    .populate("vendor", "businessName email status statusReason suspendedAt")
    .sort({ createdAt: -1 });
    res.json(appeals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/appeals/:id/review  (admin marks as reviewed)
const markReviewed = async (req, res) => {
  try {
    const { decision, rejectionReason } = req.body;

    const appeal = await Appeal.findByIdAndUpdate(
      req.params.id,
      {
        status: "reviewed",
        decision: decision || null,
        rejectionReason: decision === "rejected" ? (rejectionReason?.trim() || null) : null,
      },
      { returnDocument: "after" }
    ).populate("vendor", "businessName email");

    if (!appeal) return res.status(404).json({ message: "Appeal not found." });

    if (decision === "accepted" && appeal.vendor?.email) {
      try {
        await transporter.sendMail({
          from:    `"KuduDash" <${process.env.SMTP_USER}>`,
          to:      appeal.vendor.email,
          subject: "Your account has been reinstated",
          text:    `Hi ${appeal.vendor.businessName},\n\nGreat news — your appeal has been reviewed and your KuduDash vendor account has been reinstated. You can now log in and resume taking orders.\n\nIf you have any questions, feel free to reach out to our support team.\n\n— KuduDash Support`,
        });
      } catch (err) {
        console.error("Reinstatement email failed:", err.message);
      }
    }

    if (decision === "rejected" && appeal.vendor?.email) {
      const reason = rejectionReason?.trim() || "your appeal did not meet our reinstatement criteria at this time";
      try {
        await transporter.sendMail({
          from:    `"KuduDash" <${process.env.SMTP_USER}>`,
          to:      appeal.vendor.email,
          subject: "Update on your suspension appeal",
          text:    `Hi ${appeal.vendor.businessName},\n\nThank you for submitting an appeal. After careful review, we have unfortunately decided not to reinstate your account at this time.\n\nReason: ${reason}\n\nIf you believe this decision was made in error or your circumstances have changed, you are welcome to contact our support team.\n\n— KuduDash Support`,
        });
      } catch (err) {
        console.error("Rejection email failed:", err.message);
      }
    }

    res.json(appeal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appeals/vendor/:vendorId  (check if vendor has a pending appeal)
const getVendorAppeal = async (req, res) => {
  try {
    const appeal = await Appeal.findOne({
      vendor: req.params.vendorId,
    }).sort({ createdAt: -1 }); // most recent appeal, any status
    if (!appeal) return res.status(404).json({ message: "No pending appeal found." });
    res.json(appeal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/vendors/:id/reinstate
const reinstateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: "active", statusReason: null, suspendedAt: null },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitAppeal, getAllAppeals, markReviewed, getVendorAppeal, reinstateVendor };