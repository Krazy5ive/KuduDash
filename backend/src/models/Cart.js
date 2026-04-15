const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        specialNote: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    collection: "carts",
  }
);

module.exports = mongoose.model("Cart", cartSchema);