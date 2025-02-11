const Job = require('../model/jobHandler')
const connectDB = require('../utils/db')
const { JobSchema } = require('../validation/jobValidation')
connectDB()
const logger = require('../utils/logger')
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
        const job = new Job({ type, data, scheduledTime, status: "pending" });
        await job.save();
    
        res.status(201).json({ success: true, job });
      } catch (err) {
        logger.error('error occured in create job route')
        res.status(500).json({ success: false, error: err.message });
      }
}