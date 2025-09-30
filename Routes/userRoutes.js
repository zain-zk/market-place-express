const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const upload = require("../config/upload");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const protect = require("../middleware/authMiddleware");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ===================== REGISTER =====================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      phone,
      company,
      location,
      experience,
      skill,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword || !role) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // check if already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const newUser = new User({
      name,
      email,
      password, // Will be hashed by the pre-save middleware
      role,
      company: company || "",
      phone: phone || "",
      location: location || "",
      experience: experience || 0,
      skill: skill || "",
    });

    await newUser.save();

    res.json({
      message: "User Registered Successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error Registering User", error: error.message });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // find user by email only
    const user = await User.findOne({ email, name });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid name , email or password" });
    }

    // compare password using the schema method
    const isMatch = await user.matchPassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid email name or password" });
    }

    // Verify username matches if provided
    if (name && user.name !== name) {
      return res.status(400).json({ message: "Invalid username" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl, // ✅ include this
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// ===================== PROFILE =====================
// Get logged-in user's profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
});

// Update logged-in user's profile
router.put("/profile", protect, async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || "",
      company: req.body.company || "",
      skill: req.body.skill || "",
      experience: req.body.experience || "",
      location: req.body.location || "",
    };

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: false,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: err.message });
  }
});

// ================== Upload Avatar ==================
router.put("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = req.user;
    console.log("User found for avatar upload:", user);
    if (!user) return res.status(404).json({ message: "User not found" });
    // If old avatar exists, delete from Cloudinary
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    // Save new avatar info
    user.avatarUrl = req.file.path; // Cloudinary returns the hosted URL here
    user.avatarPublicId = req.file.filename; // Cloudinary public ID
    await user.save();

    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error("❌ Avatar upload error:", err.message);
    res.status(500).json({ message: "Error uploading avatar" });
  }
});

// ===================== ONE-TIME PASSWORD MIGRATION =====================
// Endpoint to migrate passwords - protect this in production!
// router.post("/migrate-passwords", async (req, res) => {
//   try {
//     const users = await User.find();
//     let migratedCount = 0;

//     for (let user of users) {
//       // if it's not already hashed
//       // if (!user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
//         // const hashed = await bcrypt.hash("1234", 10);
//         user.password = "1234"; // Set default password to "1234"
//         await user.save();
//         console.log(`🔑 Updated password for ${user.email}`);
//         migratedCount++;
//       // }
//     }

//     console.log("✅ Migration complete");
//     res.json({ message: `Successfully migrated ${migratedCount} users` });
//   } catch (error) {
//     console.error("Migration error:", error);
//     res.status(500).json({ message: "Error during migration", error: error.message });
//   }
// });

//me call
router.get("/me", protect, async (req, res) => {
  try {
    const user = req.user; //Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});

module.exports = router;
