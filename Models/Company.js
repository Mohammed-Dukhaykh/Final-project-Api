const mongoose = require("mongoose")
const Joi = require("joi")

const CompanySchema = new mongoose.Schema({
  companyName: String,
  avatar: String,
  commenicalNumber: String,
  jobs: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Job",
    },
  ],
  CEO: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  HR: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  Users: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  posts : [
    {
      type : mongoose.Types.ObjectId ,
      ref : "Post"
    }
  ]
})

const CompanySignupJoi = Joi.object({
  companyName: Joi.string().min(2).max(100).required(),
  avatar: Joi.string().uri().min(5).max(1000).required(),
  commenicalNumber: Joi.string().min(0).max(400).required(),
})
const CompanyLoginJoi = Joi.object({
    email: Joi.string(),
  password: Joi.string().min(6).max(100).required(),
})


const Company = mongoose.model("Company" , CompanySchema)

module.exports.Company = Company
module.exports.CompanySignupJoi = CompanySignupJoi
module.exports.CompanyLoginJoi = CompanyLoginJoi

