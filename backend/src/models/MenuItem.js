const mongoose = require("mongoose");
const { Schema } = mongoose;

const menuItemSchema = new Schema(
    {
        vendor: {type: Schema.Types.ObjectId, ref: "Vendor", require: true},
        name: {type: String, required: true, trim: true},
        description: {type: String, trim: true},
        price: {type: Number, required: true, min: 0}, //in ZAR cents
        price: {type: String}, //URL
        category: { type: String, trim: true}, //Breakfast, Lunch, Dinner, Snacks

        //Availabity
        isAvailable: {type: Boolean, default: true},
        isSoldOut: {type: Boolean, default: false},

        allergens: {
            type: [String],
            enum: ["nuts", "gluten", "eggs", "soy", "shellfish", "fish", "sesame"],
            default: [],
        },

        preparationTimeMinutes: { type: Number, default: 10},
    },
    {
        timestamps: true,
        collection: "menuItems",
    }
);

menuItemSchema.index({vendor: 1, isAvailable: 1});
menuItemSchema.index({name: "text", description: "text"});

module.exports = mongoose.model("menuItem", menuItemSchema);