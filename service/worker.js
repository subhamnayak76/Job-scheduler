const { Worker } = require("bullmq");
const Job = require("../model/jobHandler");
const nodemailer = require("nodemailer");
const { REDIS_HOST, REDIS_PORT } = require("../config/config");

const jobWorker = new Worker("jobQueue", async (job) => {
  console.log(`Processing job: ${job.id}, Type: ${job.name}`);

  try {
    if (job.name === "email") {
      const { to } = job.data.data;
      await sendEmail(to);
    }

    await Job.findByIdAndUpdate(job.data._id, { status: "completed" });

    console.log(`Job ${job.id} completed`);
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    await Job.findByIdAndUpdate(job.data._id, { status: "failed" });
  }
}, { connection: { host: REDIS_HOST, port: REDIS_PORT } });

console.log("Worker started...");

// Email Sending Function
async function sendEmail(to) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: '', pass: '' },
  });

  await transporter.sendMail({
    from: " ",
    to,
    subject: "Test Email",
    text: "This is a scheduled email.",
  });

  console.log(`Email sent to ${to}`);
}
