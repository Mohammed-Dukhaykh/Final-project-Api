const mongoose = require("mongoose")
const Joi = require("joi")

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  poster: String,
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Company",
  },
  employeeId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  usersApply: [
    {
      type: mongoose.Types.ObjectId,
      ref: "ApplyJob",
    },
  ],
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  questions: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Question",
    },
  ],
  jobField: {
    type: mongoose.Types.ObjectId,
    ref: "Interesting",
  },
})

const jobJoi = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(10).max(10000).required(),
  poster: Joi.string().uri().min(3).max(1000).required(),
  jobField: Joi.ObjectId().required(),
})
const jobEditJoi = Joi.object({
  title: Joi.string().min(3).max(50),
  description: Joi.string().min(10).max(10000),
  poster: Joi.string().uri().min(3).max(1000),
})

const Job = mongoose.model("Job", JobSchema)

module.exports.Job = Job
module.exports.jobJoi = jobJoi
module.exports.jobEditJoi = jobEditJoi
