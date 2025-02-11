
const { Queue } = require("bullmq");
const cron = require("node-cron");
const Job = require("../model/jobHandler");
const { MONGO_URI, REDIS_HOST, REDIS_PORT } = require("../config/config");
const connectDB = require('../utils/db')
const logger = require('../utils/logger')
connectDB()
const jobQueue = new Queue("jobQueue", { connection: { host: REDIS_HOST, port: REDIS_PORT } });


cron.schedule("* * * * *", async () => {
  logger.info("Checking for scheduled jobs...");

  const now = new Date();
  const jobs = await Job.find({ scheduledTime: { $lte: now }, status: "pending" });
  console.log('here')
  console.log(jobs)
  for (const job of jobs) {
    logger.info(`Scheduling job ${job._id} for execution...`);
    
    await Job.findByIdAndUpdate(job._id, { status: "processing" });
    await jobQueue.add(job.type, job);
  }
});

logger.info("Watcher service running with node-cron...");
 