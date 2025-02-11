const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  data: { type: Object, required: true }, 
  status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
  scheduledTime: { type: Date, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", JobSchema);
