const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
   {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
   client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to client
//  
  },
  { timestamps: true }
);

module.exports = mongoose.model('Requirement' , requirementSchema);