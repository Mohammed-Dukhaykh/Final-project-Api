const mongoose = require("mongoose")
const Joi = require("joi")

const VisitorSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
})


const Visitor = mongoose.model("Visitor" , VisitorSchema)


module.exports = Visitor