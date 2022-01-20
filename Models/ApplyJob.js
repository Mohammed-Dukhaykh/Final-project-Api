const mongoose = require("mongoose")
const Joi = require("joi")

const ApplyJobSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: Number,
  skills: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Skill",
    },
  ],
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  jobId: {
    type: mongoose.Types.ObjectId,
    ref: "Job",
  },
  progress: {
    type: String,
    enum: ["Accept", "No Accept", "Submitted"],
    default: "Submitted",
  },
  answers: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Answer",
    },
  ],
  ResumeCv: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
})

const ApplyJobJoi = Joi.object({
  skills: Joi.array().items(Joi.ObjectId()).min(1).required(),
  phoneNumber: Joi.number().min(10).required(),
  answers: Joi.array().items(
    Joi.object({
      answer: Joi.string().required(),
      question: Joi.ObjectId().required(),
    })
  ),
  ResumeCv: Joi.string().uri().min(5).max(1000).required(),
})
const jobProgress = Joi.object({
  progress: Joi.string().valid("Accept", "No Accept").required(),
})

const ApplyJob = mongoose.model("ApplyJob", ApplyJobSchema)

module.exports.ApplyJob = ApplyJob
module.exports.ApplyJobJoi = ApplyJobJoi
module.exports.jobProgress = jobProgress
