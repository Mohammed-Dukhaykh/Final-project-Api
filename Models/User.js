const mongoose = require("mongoose")
const Joi = require("joi")
const joiObjectid = require("joi-objectid")
const { boolean } = require("joi")
Joi.ObjectId = joiObjectid(Joi)

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  avatar: String,

  JobsApply: [
    {
      type: mongoose.Types.ObjectId,
      ref: "ApplyJob",
    },
  ],
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
  Work: {
    type: mongoose.Types.ObjectId,
    ref: "Company",
  },
  profileWatch: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Visitor",
    },
  ],
  followers: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  followwnig: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  skills: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Skill",
    },
  ],
  Certificates: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Certificate",
    },
  ],
  Experience: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Experience",
    },
  ],
  Education: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Education",
    },
  ],
  summary: {
    type: String,
  },
  interesting: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Interesting",
    },
  ],
  jobInterest: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Job",
    },
  ],
  emailVerified: {
    type: Boolean,
    default: false,
  },
  Resume: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  ],
  isHR: {
    type: Boolean,
    default: false,
  },
  isCEO: {
    type: Boolean,
    default: false,
  },
})

const UserSignupJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .min(2)
    .max(200)
    .required(),
  password: Joi.string().min(6).max(100).required(),
  avatar: Joi.string().uri().min(5).max(1000).required(),
  // Certificates: Joi.array().items(Joi.string()).min(2).max(100),

  // Experience: Joi.array().items(Joi.string()).min(1).max(20),
  // Education: Joi.array().items(Joi.string()).min(1).max(20),
  // summary: Joi.string().min(2).max(1000),
  // work: Joi.ObjectId(),
})
const UserAdminSignupJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .min(2)
    .max(200)
    .required(),
  password: Joi.string().min(6).max(100).required(),
  avatar: Joi.string().uri().min(5).max(1000).required(),
  role: Joi.string().valid("Admin", "User"),
})
const UserLoginJoi = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .min(2)
    .max(200)
    .required(),
  password: Joi.string().min(6).max(100).required(),
})
const profileJoi = Joi.object({
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100),
  password: Joi.string().min(6).max(100),
  avatar: Joi.string().uri().min(5).max(1000),
  Work: Joi.ObjectId(),
  Certificates: Joi.array().items(Joi.string()).min(2).max(100),
  skills: Joi.array().items(Joi.ObjectId()).min(1),
  Education: Joi.array().items(Joi.string()).min(1).max(20),
  summary: Joi.string().min(2).max(1000),
  Resume: Joi.string().uri().min(5).max(1000),
})
const skillprofile = Joi.object({
  skill: Joi.array().items(Joi.ObjectId()).min(1).required(),
})
const interestingprofile = Joi.object({
  interesting: Joi.array().items(Joi.ObjectId()).min(1).required(),
})
const ResumeJoi = Joi.object({
  resume: Joi.string().uri().min(5).max(1000).required(),
})
const summaryJoi = Joi.object({
  summary: Joi.string().min(1).max(10000).required(),
})

const User = mongoose.model("User", UserSchema)

module.exports.User = User
module.exports.UserSignupJoi = UserSignupJoi
module.exports.UserAdminSignupJoi = UserAdminSignupJoi
module.exports.UserLoginJoi = UserLoginJoi
module.exports.profileJoi = profileJoi
module.exports.skillprofile = skillprofile
module.exports.interestingprofile = interestingprofile
module.exports.ResumeJoi = ResumeJoi
module.exports.summaryJoi = summaryJoi
