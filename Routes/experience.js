const express = require("express")
const CheckId = require("../middleware/CheckId")
const checkToken = require("../middleware/CheckToken")
const ValidateBody = require("../middleware/ValidateBody")
const { Experience, ExperienceJoi, ExperienceEditJoi } = require("../Models/Experience")
const { User, UserSignupJoi, UserLoginJoi, profileJoi, UserAdminSignupJoi } = require("../Models/User")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const response = await Experience.find()
    res.json(response.data)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

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

router.put("/:id", CheckId, checkToken, ValidateBody(ExperienceEditJoi), async (req, res) => {
  try {
    const { company, jobtitle, start, end } = req.body
    // const experienceFound = await Experience.findOne({ owner: req.userId })
    const experienceFound = await Experience.findById(req.params.id).populate("owner")
    if (!experienceFound) return res.status(404).json("The Experience Not Found")
    if (experienceFound.owner._id.toString() != req.userId) return res.status(404).json("UnAuthorization Action")
    const updateExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      { $set: { company, jobtitle, start, end } },
      { new: true }
    ).select("-password")

    res.json(updateExperience)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.delete("/:id", CheckId, checkToken, async (req, res) => {
  try {
    const experienceFound = await Experience.findById(req.params.id)
    if (!experienceFound) return res.status(404).json("The Experience Not Found")
    if (experienceFound.owner._id.toString() != req.userId) return res.status(404).json("UnAuthorization Action")
    await Experience.findByIdAndDelete(req.params.id)
    await User.findByIdAndUpdate(req.userId, { $pull: { Experience: req.params.id } } )
    res.send("The Experience is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
