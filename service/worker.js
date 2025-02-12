const { Worker } = require("bullmq");
const Job = require("../model/jobHandler");
const nodemailer = require("nodemailer");
const { REDIS_HOST, REDIS_PORT } = require("../config/config");
const { Redis } = require('ioredis');  
const RedLock = require('redlock').default;
const connectDB = require('../utils/db');
const logger = require("../utils/logger");
const redisClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const redlock = new RedLock([redisClient], {
  retryCount: 3,
});


connectDB()
const jobWorker = new Worker("jobQueue", async (job) => {
  logger.info(`Processing job: ${job.id}, Type: ${job.name}`);
  const lockKey = `lock:worker:${job.id}`;
  try {
    const lock = await redlock.acquire([lockKey], 30000)
    logger.info('locked achived')
    if (job.name === "email") {
      const { to ,from,subject,message} = job.data.data;
      await sendEmail(to,from,subject,message);
    }

    await Job.findByIdAndUpdate(job.data._id, { status: "completed" });
    await lock.release();
    logger.info(`Job ${job.id} completed`);
  } catch (error) {
    logger.error(`Job ${job.id} failed:`, error);
    await Job.findByIdAndUpdate(job.data._id, { status: "failed" });
  }
}, { connection: { host: REDIS_HOST, port: REDIS_PORT } ,settings: {
  stalledInterval: 30000, 
  maxStalledCount: 1,       
},},);

logger.info("Worker started...");


async function sendEmail(to,from,subject,message) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.USER, pass: process.env.APP_PASS },
  });

  await transporter.sendMail({
    from ,
    to,
    subject,
    text:message
  });

  logger.info(`Email sent to ${to}`);
}

jobWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});

jobWorker.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled and will be retried if attempts remain.`);

})