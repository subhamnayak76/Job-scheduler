const express = require("express");
const mongoose = require("mongoose");
const Job = require("./model/jobHandler");
const { MONGO_URI } = require("./config/config");
const connectDB = require('./utils/db')
const app = express();
app.use(express.json());


connectDB()

app.post("/create-job", async (req, res) => { 
  try {
    const { type, data, scheduledTime } = req.body;
    if (!scheduledTime) return res.status(400).json({ error: "Scheduled time is required" });

    const job = new Job({ type, data, scheduledTime, status: "pending" });
    await job.save();

    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
