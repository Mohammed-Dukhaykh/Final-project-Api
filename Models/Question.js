const mongoose = require("mongoose")
const Joi = require("joi")

const QuestionSchema = new mongoose.Schema({
  question: String
})

const QuestionJoi = Joi.object({
  question: Joi.string().min(5).max(200).required()
})

const Question = mongoose.model("Question", QuestionSchema)

module.exports.Question = Question
module.exports.QuestionJoi = QuestionJoi
