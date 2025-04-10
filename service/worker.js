const { Worker } = require("bullmq");
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();
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

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
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
    else if (job.name === "tweet") {
      const { content, hashtags, mediaUrls } = job.data.data;
      await sendTweet(content, hashtags, mediaUrls);
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
    auth: { user: '', pass: '' },
  });

  await transporter.sendMail({
    from ,
    to,
    subject,
    text:message
  });

  logger.info(`Email sent to ${to}`);
}

async function sendTweet(content) {
  try {
    
    const { data } = await twitterClient.v2.tweet(content);
    
    logger.info(`Tweet posted: ${content.substring(0, 30)}... (ID: ${data.id})`);
    return data;
  } catch (error) {
    logger.error(' Error posting tweet:', error);
    throw error;
  }
}

jobWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});

jobWorker.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled and will be retried if attempts remain.`);

})