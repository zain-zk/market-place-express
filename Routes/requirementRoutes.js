const express = require("express");
const router = express.Router();
const Requirement = require("../models/Requirement");
const { findById } = require("../models/Message");
const Bid = require("../models/bidModel");

// POST requirement
router.post("/", async (req, res) => {
  try {
    console.log("📝 Received request body:", req.body);
    const { title, description, price, location, client } = req.body;

    if (!title || !description || !price || !location || !client) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPrice = Number(price);
    if (isNaN(newPrice) || newPrice <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const newRequirement = new Requirement({
      title,
      description,
      price: newPrice,
      location,
      client, // ✅ store client here
    });

    await newRequirement.save();
    res.json({
      message: "Requirement created successfully",
      requirement: newRequirement,
    });
  } catch (error) {
    console.error("Error creating requirement:", error);
    res
      .status(500)
      .json({ message: "Error creating requirement", error: error.message });
  }
});

// Get requirements by client
router.get("/my/:clientId", async (req, res) => {
  try {
    const requirements = await Requirement.find({
      client: req.params.clientId,
    });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: "Error Getting requirement", error });
  }
});

// Get all requirements
router.get("/", async (req, res) => {
  try {
    const requirements = await Requirement.find().populate(
      "client",
      "name email"
    ); // ✅ use client not clientId
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requirements", error });
  }
});

// get one requirement by id
router.get("/:id", async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }
    res.json(requirement);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// update requirement by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedRequirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // return the updated doc
        runValidators: true, // also run schema validators on update
      }
    );

    if (!updatedRequirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    res.json(updatedRequirement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating requirement", error });
  }
});

//delete requirement// or wherever your Bids model is

router.delete("/:id", async (req, res) => {
  try {
    const reqId = req.params.id;

    // Delete the requirement itself
    const deleteRequirement = await Requirement.findByIdAndDelete(reqId);

    if (!deleteRequirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    // Delete all bids related to this requirement
    await Bid.deleteMany({ requirement: reqId });

    res.json({
      message: "Requirement and its bids deleted successfully",
      requirement: deleteRequirement,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting requirement and bids", error });
  }
});

module.exports = router;
