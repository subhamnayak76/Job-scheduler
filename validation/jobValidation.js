const { z } = require('zod');

const JobSchema = z.object({
  type: z.enum(["email", "tweet"]), 
  data: z.union([
    
    z.object({
      to: z.string().email(),
      subject: z.string().min(1, "Subject is required"),
      message: z.string().min(1, "Message is required"),
    }),
    
    z.object({
      content: z.string().max(280, "Tweet cannot exceed 280 characters"),
      hashtags: z.array(z.string()).optional(),
      mediaUrls: z.array(z.string().url()).optional(),
    })
  ]),
  scheduledTime: z.string().regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
    "Invalid scheduledTime format, expected YYYY-MM-DDTHH:mm:ss (IST)"
  ),
});

module.exports = {
    JobSchema
}