const express = require("express")
const ValidateBody = require("../middleware/ValidateBody")
const CheckId = require("../middleware/CheckId")
const ValidateId = require("../middleware/ValidateId")
const checkToken = require("../middleware/CheckToken")
const { Post, PostEditJoi, PostJoi } = require("../Models/Post")
const CheckCompany = require("../middleware/CheckCompany")
const { User } = require("../Models/User")
const CheckAdminCompany = require("../middleware/CheckAdminCompany")
const { Company } = require("../Models/Company")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const post = await Post.find()
      .populate({
        path: "ownerUser",
        select: "firstName lastName avatar",
      })
      .populate({
        path: "ownerCompany",
        select: "companyName avatar",
      })
    res.json(post)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/", checkToken, ValidateBody(PostJoi), async (req, res) => {
  try {
    const { photo, description } = req.body
    const postBody = new Post({
      photo,
      description,
      ownerUser: req.userId,
    })
    await User.findByIdAndUpdate(req.userId, { $push: { posts: postBody._id } })
    await postBody.save()
    res.json(postBody)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.post("/company", CheckCompany, ValidateBody(PostJoi), async (req, res) => {
  try {
    const { photo, description } = req.body
    const postBody = new Post({
      photo,
      description,
      ownerCompany: req.companyId,
    })
    await Company.findByIdAndUpdate(req.companyId, { $push: { posts: postBody._id } })
    await postBody.save()
    res.json("The Post is Added")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.put("/company/:id", CheckCompany, ValidateBody(PostEditJoi), async (req, res) => {
  try {
    const { photo, description } = req.body
    const companyPost = await Post.findById(req.params.id)
    if (companyPost.ownerCompany.toString() != req.companyId._id) return res.status(403).json("UnAuthorization Action")
    const post = await Post.findByIdAndUpdate(req.params.id, { $set: { photo, description } }, { new: true })
    if (!post) return res.status(404).json("The Post Not found")
    res.send("The Post is Update")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.put("/:id", checkToken, ValidateBody(PostJoi), async (req, res) => {
  try {
    const { photo, description } = req.body
    const postFound = await Post.findById(req.params.id)
    if (postFound.ownerUser.toString() != req.userId) return res.status(403).json("UnAuthorization Action")
    const post = await Post.findByIdAndUpdate(req.params.id, { $set: { photo, description } }, { new: true })
    if (!post) return res.status(404).json("The Post Not found")
    res.send("The Post is Update")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.delete("/:id", checkToken, CheckId, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const postFound = await Post.findById(req.params.id)
    if (!postFound) return res.status(404).json("The Post Not found")
    if (user._id.toString() != postFound.ownerUser && user.role != "Admin")
      return res.status(404).json("UnAuthorization Action")
    await Post.findByIdAndDelete(postFound)
    await User.findByIdAndUpdate(req.userId, { $pull: { posts: req.params.id } })

    res.json("The Post is Delete")
  } catch {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.delete("/company/:id", CheckId, CheckAdminCompany, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json("The Post Not found")
    //   return console.log(post.ownerCompany.toString() , req.companyId._id)
    if (post.ownerCompany.toString() != req.companyId._id) return res.status(404).json("UnAuthorization Action")
    await Post.findByIdAndDelete(req.params.id)
    await Company.findByIdAndUpdate(req.companyId._id, { $pull: { posts: req.params.id } })
    res.json("The post is Delete")
  } catch {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
