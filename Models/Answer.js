const mongoose = require("mongoose")
const Joi = require("joi")

const AnswerSchema = new mongoose.Schema({
  answer: {
    type: String,
  },
  question: {
    type: mongoose.Types.ObjectId,
    ref: "Question",
  },
})

const AnswerJoi = Joi.object({
  answers: Joi.string().max(100).min(10),
})

const Answer = mongoose.model("Answer", AnswerSchema)

module.exports.Answer = Answer
module.exports.AnswerJoi = AnswerJoi
