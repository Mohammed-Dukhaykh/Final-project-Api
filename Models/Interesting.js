const mongoose = require("mongoose")
const Joi = require("joi")

const InterestingSchema = new mongoose.Schema({
    name : String
})


const InterestingJoi = Joi.object({
    name : Joi.string().min(3).max(100).required(),
})


const Interesting = mongoose.model("Interesting" , InterestingSchema)


module.exports.Interesting = Interesting
module.exports.InterestingJoi = InterestingJoi


