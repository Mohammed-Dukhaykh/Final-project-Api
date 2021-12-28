const checkToken = require("../middleware/CheckToken")
const ValidateBody = require("../middleware/ValidateBody")
const express = require("express")
const { User, UserSignupJoi, UserLoginJoi, profileJoi, UserAdminSignupJoi } = require("../Models/User")
const { educationJoi, Education, educationEditJoi } = require("../Models/Education")

const router = express.Router()

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
router.put("/", checkToken, ValidateBody(educationEditJoi), async (req, res) => {
  try {
    const { university, degree, field, start, end } = req.body
    const EducationFound = await Education.findOne({ owner: req.userId })
    if (!EducationFound) return res.status(404).json("The Education Not Found")
    const EducationUpdate = await Education.findByIdAndUpdate(
      EducationFound._id,
      { $set: { university, degree, field, start, end } },
      { new: true }
    ).select("-password")

    res.json(EducationUpdate)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
