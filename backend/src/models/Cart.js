const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true,
      unique: true},
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
        quantity: { type: Number, required: true, min: 1 },
        name: { type: String, required: true },     
    unitPrice: { type: Number, required: true },
        specialNote: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 },

    status: {type: String,
    enum: ["active", "pending", "paid"],
    default: "active",
  },
  },
  {
    timestamps: true,
    collection: "carts",
  }
);

cartSchema.index({ student: 1, "items.menuItem": 1 }, { unique: true, sparse: true });

cartSchema.virtual("total").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);