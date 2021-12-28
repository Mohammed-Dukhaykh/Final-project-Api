const mongoose = require("mongoose")
const Joi = require("joi")


const ExperienceSchema = new mongoose.Schema({
    company : String , 
    jobtitle : String ,
    start : Date ,
    end : Date ,
    owner : {
        type : mongoose.Types.ObjectId ,
        ref : "User"
    }
})



const ExperienceJoi = Joi.object({
    company : Joi.string().min(3).max(50).required() ,
    jobtitle : Joi.string().min(3).max(50).required() ,
    start : Joi.date().required() ,
    end : Joi.date().required() ,
})

const ExperienceEditJoi = Joi.object({
    company : Joi.string().min(3).max(50),
    jobtitle : Joi.string().min(3).max(50),
    start : Joi.date(),
    end : Joi.date(),
})

const Experience = mongoose.model("Experience" , ExperienceSchema)

module.exports.Experience = Experience
module.exports.ExperienceJoi = ExperienceJoi
module.exports.ExperienceEditJoi = ExperienceEditJoi



