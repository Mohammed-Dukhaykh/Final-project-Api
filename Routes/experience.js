const express = require("express")
const checkToken = require("../middleware/CheckToken")
const ValidateBody = require("../middleware/ValidateBody")
const { Experience, ExperienceJoi, ExperienceEditJoi } = require("../Models/Experience")
const { User, UserSignupJoi, UserLoginJoi, profileJoi, UserAdminSignupJoi } = require("../Models/User")

const router = express.Router()

router.post("/", checkToken, ValidateBody(ExperienceJoi), async (req, res) => {
  try {
    const { company, jobtitle, start, end } = req.body

    const experience = new Experience({
      company,
      jobtitle,
      start,
      end,
      owner: req.userId,
    })
    await experience.save()
    // const timePeriod = experience.end - experience.start
    // await Experience.findByIdAndUpdate(experience._id, { $set: { timePeriod } }, { new: true })
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { Experience: experience._id } },
      { new: true }
    ).select("-password")
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.put("/", checkToken, ValidateBody(ExperienceEditJoi), async (req, res) => {
  try {
    const { company, jobtitle, start, end } = req.body
    const experienceFound = await Experience.findOne({ owner: req.userId })
    if (!experienceFound) return res.status(404).json("The Experience Not Found")
    const updateExperience = await Experience.findByIdAndUpdate(
      experienceFound._id,
      { $set: { company, jobtitle, start, end } },
      { new: true }
    ).select("-password")
    
    res.json(updateExperience)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
