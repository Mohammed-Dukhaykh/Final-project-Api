const express = require("express")
const ValidateBody = require("../middleware/ValidateBody")
const CheckId = require("../middleware/CheckId")
const checkToken = require("../middleware/CheckToken")
const { Resume, ResumeJoi } = require("../Models/Resume")
const { User } = require("../Models/User")

const router = express.Router()

router.post("/", checkToken, ValidateBody(ResumeJoi), async (req, res) => {
  try {
    const { resume } = req.body
    const resumeBody = new Resume({
      resume,
      owner: req.userId,
    })
    await resumeBody.save()
    const user = await User.findByIdAndUpdate(req.userId, { Resume: resumeBody._id }, { new: true })
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.put("/", checkToken, ValidateBody(ResumeJoi), async (req, res) => {
  try {
    const { resume } = req.body
    const ResumeFound = await Resume.findOneAndUpdate({ owner: req.userId }, { resume }, { new: true })
    if (!ResumeFound) return res.status(404).json("The Resume Not Found")
    res.json(ResumeFound)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
