
const { Queue } = require("bullmq");
const cron = require("node-cron");
const Job = require("../model/jobHandler");
const { MONGO_URI, REDIS_HOST, REDIS_PORT } = require("../config/config");
const connectDB = require('../utils/db')

connectDB()
const jobQueue = new Queue("jobQueue", { connection: { host: REDIS_HOST, port: REDIS_PORT } });


cron.schedule("* * * * *", async () => {
  console.log("Checking for scheduled jobs...");

  const now = new Date();
  const jobs = await Job.find({ scheduledTime: { $lte: now }, status: "pending" });
  console.log('here')
  console.log(jobs)
  for (const job of jobs) {
    console.log(`Scheduling job ${job._id} for execution...`);
    
    await Job.findByIdAndUpdate(job._id, { status: "processing" });
    await jobQueue.add(job.type, job);
  }
});

console.log("Watcher service running with node-cron...");
 