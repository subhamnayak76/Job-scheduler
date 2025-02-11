const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/config");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(" MongoDB Connected");
  } catch (err) {
    console.error(" MongoDB Connection Failed:", err);
    process.exit(1); 
  }
};

module.exports = connectDB;
