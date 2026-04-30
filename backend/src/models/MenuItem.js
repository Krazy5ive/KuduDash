const mongoose = require("mongoose");
const { Schema } = mongoose;

const menuItemSchema = new Schema(
    {
        vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        price: { type: Number, required: true, min: 0 },
        imageUrl: { type: String, default: "" },
        category: { type: String, trim: true },

        // Approval workflow
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        approvalReason: { type: String, default: "" },
        approvedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
        approvedAt: { type: Date },

        // Availability
        isAvailable: { type: Boolean, default: true },
        isSoldOut: { type: Boolean, default: false },

        allergens: {
            type: [String],
            enum: ["nuts", "gluten", "eggs", "soy", "shellfish", "fish", "sesame"],
            default: [],
        },

        preparationTimeMinutes: { type: Number, default: 10 },
    },
    {
        timestamps: true,
        collection: "menuItems",
    }
);

menuItemSchema.index({ vendor: 1, isAvailable: 1 });
menuItemSchema.index({ name: "text", description: "text" });
menuItemSchema.index({ vendor: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("menuItem", menuItemSchema);