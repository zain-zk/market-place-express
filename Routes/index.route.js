const express = require("express");
const router = express.Router();
const userRoute = require("./userRoutes");
const requirementRoutes = require("./requirementRoutes");
const bidRoutes = require("./bidRoutes");

const chatRoutes = require("./chatRoute");

router.use("/api/users", userRoute);
router.use("/api/requirements", requirementRoutes);
router.use("/api/messages", chatRoutes); // <-- Added for chat/messages
router.use("/api/bids", bidRoutes);

module.exports = router;
