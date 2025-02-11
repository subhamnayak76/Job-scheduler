const { Worker } = require("bullmq");
const Job = require("../model/jobHandler");
const nodemailer = require("nodemailer");
const { REDIS_HOST, REDIS_PORT } = require("../config/config");
const { Redis } = require('ioredis');  
const RedLock = require('redlock').default;
const connectDB = require('../utils/db')
const redisClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const redlock = new RedLock([redisClient], {
  retryCount: 3,
});
connectDB()
const jobWorker = new Worker("jobQueue", async (job) => {
  console.log(`Processing job: ${job.id}, Type: ${job.name}`);
  const lockKey = `lock:worker:${job.id}`;
  try {
    const lock = await redlock.acquire([lockKey], 30000)
    console.log('locked achived')
    if (job.name === "email") {
      const { to ,from,subject,message} = job.data.data;
      await sendEmail(to,from,subject,message);
    }

    await Job.findByIdAndUpdate(job.data._id, { status: "completed" });
    await lock.release();
    console.log(`Job ${job.id} completed`);
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    await Job.findByIdAndUpdate(job.data._id, { status: "failed" });
  }
}, { connection: { host: REDIS_HOST, port: REDIS_PORT } });

console.log("Worker started...");

// Email Sending Function
async function sendEmail(to,from,subject,message) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: '', pass: '' },
  });

  await transporter.sendMail({
    from ,
    to,
    subject,
    text:message
  });

  console.log(`Email sent to ${to}`);
}
