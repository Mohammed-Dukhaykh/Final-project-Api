const mongoose = require("mongoose")
const Joi = require("joi")

const CertificatesSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  title: String,
  authority: String,
  certificateFile: String,
})

const CertificatesJoi = Joi.object({
    title : Joi.string().min(3).max(100).required() ,
    authority : Joi.string().min(3).max(50).required() ,
    certificateFile : Joi.string().uri().max(1000)
})
const CertificatesEditJoi = Joi.object({
    title : Joi.string().min(3).max(100) ,
    authority : Joi.string().min(3).max(50) ,
    certificateFile : Joi.string().uri().max(1000)
})

const Certificate = mongoose.model("Certificate" , CertificatesSchema)

module.exports.Certificate = Certificate
module.exports.CertificatesJoi = CertificatesJoi
module.exports.CertificatesEditJoi = CertificatesEditJoi
