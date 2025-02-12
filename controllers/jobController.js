const Job = require('../model/jobHandler')
const connectDB = require('../utils/db')
const { JobSchema } = require('../validation/jobValidation')

const moment = require("moment-timezone");
const logger = require('../utils/logger')
connectDB()
exports.createJob =  async ( req,res)=>{
    try {
        logger.info('create job endpoint')
        const validationResult = JobSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            logger.warn('validation error in create-job route')
            return res.status(400).json({ 
                success: false, 
                error: validationResult.error.format() 
            });
        }
        const { type, data, scheduledTime } = validationResult.data;
        const utcTime = moment.tz(scheduledTime, "Asia/Kolkata").utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
        const job = new Job({ type, data, scheduledTime:utcTime, status: "pending" });
        await job.save();
    
        res.status(201).json({ success: true, job });
      } catch (err) {
        logger.error('error occured in create job route')
        res.status(500).json({ success: false, error: err.message });
      }
}