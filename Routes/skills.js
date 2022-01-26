const express = require("express")
const ValidateBody = require("../middleware/ValidateBody")
const CheckId = require("../middleware/CheckId")
const ValidateId = require("../middleware/ValidateId")
const checkToken = require("../middleware/CheckToken")
const CheckAdmin = require("../middleware/CheckAdmin")
const { Skill, SkillsJoi } = require("../Models/Skills")
const { User, skillprofile } = require("../Models/User")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find()
    res.json(skills)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/", CheckAdmin, async (req, res) => {
  try {
    const { skill } = req.body
    const skillsBody = new Skill({
      skill,
    })
    await skillsBody.save()

    res.json(skillsBody)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.put("/:id", CheckAdmin, CheckId, ValidateBody(SkillsJoi), async (req, res) => {
  try {
    const skills = await Skill.findById(req.params.id)
    if (!skills) return res.status(404).json("The skill Not found")
    const { skill } = req.body
    const skillEdit = await Skill.findByIdAndUpdate(skills, { $set: { skill } }, { new: true })
    res.json(skillEdit)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.delete("/:id", CheckAdmin, CheckId, async (req, res) => {
  try {
    const skills = await Skill.findById(req.params.id)
    if (!skills) return res.status(404).json("The skill Not found")
    await Skill.findByIdAndDelete(skills)
    res.json("The Skill is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/profile-skills", checkToken, ValidateBody(skillprofile), async (req, res) => {
  try {
    const { skill } = req.body
    const userFound = await User.findById(req.userId)
    const skillSet = new Set(skill)
    if (skillSet.size < skill.length) return res.status(404).json("There is duplicated Skills")
    const skillsFound = await Skill.find({ _id: { $in: skill } })
    if (skillsFound.length < skill.length) return res.status(404).json("There are some Skill Missing")

    const user = await User.findByIdAndUpdate(userFound, { $addToSet: { skills: skill } }, { new: true })
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})


router.delete("/profile-skills/:id", CheckId, checkToken, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
    if (!skill) return res.status(404).json("The Skill Not Found")
    await User.findByIdAndUpdate(req.userId, { $pull: { skills: req.params.id } })
    res.json("The Skill is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
