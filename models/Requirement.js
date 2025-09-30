const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["Completed", "Active", "Pending"],
      default: "Active",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // link to client
    category: {
      type: String,
      trim: true,
      default: "Unspecified",
      maxlength: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementSchema);
