const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  company: { type: String },   // only for clients
  skill: { type: String },     // only for providers
  experience: { type: Number },
  location: { type: String },
  role: { type: String, enum: ["client", "provider"], required: true },
  avatarUrl:{type: String , default:""},
  avatarPublicId:{type:String , default:""},
}, { timestamps: true });

//Hash Password before saving
userSchema.pre("save", async function(next) {
  try {
    // Only hash if password is modified
    if (!this.isModified("password")) return next();
    
    // const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, 10);
    
    // Clear confirmPassword after validation
    this.confirmPassword = undefined;
    next();
  } catch (error) {
    next(error);
  }
});

//Compare Password during Login
userSchema.methods.matchPassword= async function (enteredPassword) {
  const temp =  await bcrypt.compare(enteredPassword, this.password)  ;
  return temp;
};


module.exports = mongoose.model("User", userSchema); 
