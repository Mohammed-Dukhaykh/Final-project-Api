const mongoose = require("mongoose")
const Joi = require("joi")


const EducationSchema = new mongoose.Schema({
    university : String ,
    degree : {
        type : String ,
        enum : ["Associate" , "Bachelor's" , "Master's" , "Doctoral"]
    } , 
    field : String ,
    start : {
        type : Date ,
        
    } ,
    end : Date ,
    owner : {
        type : mongoose.Types.ObjectId ,
        ref : "User"
    }
})


const educationJoi = Joi.object({
    university : Joi.string().min(2).max(30).required() ,
    degree : Joi.string().valid("Associate" , "Bachelor's" , "Master's" , "Doctoral").required() ,
    field : Joi.string().min(2).max(50).required() ,
    start : Joi.date().required() ,
    end : Joi.date().required() ,
})
const educationEditJoi = Joi.object({
    university : Joi.string().min(2).max(50) ,
    degree : Joi.string().valid("Associate" , "Bachelor's" , "Master's" , "Doctoral"),
    field : Joi.string().min(2).max(50) ,
    start : Joi.date() ,
    end : Joi.date() ,
})



const Education = mongoose.model("Education" , EducationSchema)

module.exports.Education = Education
module.exports.educationJoi = educationJoi
module.exports.educationEditJoi = educationEditJoi