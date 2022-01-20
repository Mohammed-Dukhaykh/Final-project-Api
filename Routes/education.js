const checkToken = require("../middleware/CheckToken")
const ValidateBody = require("../middleware/ValidateBody")
const express = require("express")
const { User, UserSignupJoi, UserLoginJoi, profileJoi, UserAdminSignupJoi } = require("../Models/User")
const { educationJoi, Education, educationEditJoi } = require("../Models/Education")
const CheckId = require("../middleware/CheckId")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const education = await Education.find()
    res.send(education)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/", checkToken, ValidateBody(educationJoi), async (req, res) => {
  try {
    const { university, degree, field, start, end } = req.body
    const educationBody = new Education({
      university,
      degree,
      field,
      start,
      end,
      owner: req.userId,
    })
    await educationBody.save()
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { Education: educationBody._id } },
      { new: true }
    ).select("-password")
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.put("/:id", CheckId, checkToken, ValidateBody(educationEditJoi), async (req, res) => {
  try {
    const { university, degree, field, start, end } = req.body
    const educationFound = await Education.findById(req.params.id).populate("owner")
    if (!educationFound) return res.status(404).json("The Experience Not Found")
    if (educationFound.owner._id.toString() != req.userId) return res.status(404).json("UnAuthorization  Action")
    const EducationUpdate = await Education.findByIdAndUpdate(
      req.params.id,
      { $set: { university, degree, field, start, end } },
      { new: true }
    ).select("-password")
    res.send("The Education is Edit")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.delete("/:id", CheckId, checkToken, async (req, res) => {
  try {
    const educationFound = await Education.findById(req.params.id)
    if (!educationFound) return res.status(404).json("The Experience Not Found")
    if (educationFound.owner._id.toString() != req.userId) return res.status(404).json("UnAuthorization  Action")
    await Education.findByIdAndDelete(req.params.id)
    await User.findByIdAndUpdate(req.userId, { $pull: { Education: req.params.id } }, { new: true })
    res.json("The Education is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
