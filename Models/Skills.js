const mongoose = require("mongoose")
const Joi = require("joi")

const SkillsSchema = new mongoose.Schema({
    skill : String
})


const SkillsJoi = Joi.object({
    skill : Joi.string().min(3).max(100).required()
})



const Skill = mongoose.model("Skill" , SkillsSchema)


module.exports.Skill = Skill
module.exports.SkillsJoi = SkillsJoi