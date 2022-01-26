const mongoose = require("mongoose")
const Joi = require("joi")

const PostSchema = new mongoose.Schema({
  photo: String,
  description: String,
  ownerUser: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  ownerCompany: {
    type: mongoose.Types.ObjectId,
    ref: "Company",
  },
  date : {
    type : Date ,
    default : Date.now
  }
})

const PostJoi = Joi.object({
  photo: Joi.string().uri().min(9).max(1000).required(),
  description: Joi.string().min(5).max(1000).required(),
})

const PostEditJoi = Joi.object({
  photo: Joi.string().uri().min(9).max(1000),
  description: Joi.string().min(5).max(1000),
})

const Post = mongoose.model("Post", PostSchema)

module.exports.Post = Post
module.exports.PostJoi = PostJoi
module.exports.PostEditJoi = PostEditJoi
