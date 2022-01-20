const express = require("express")
const ValidateBody = require("../middleware/ValidateBody")
const CheckId = require("../middleware/CheckId")
const CheckAdmin = require("../middleware/CheckAdmin")
const { Interesting, InterestingJoi } = require("../Models/Interesting")
const { interestingprofile, User } = require("../Models/User")
const checkToken = require("../middleware/CheckToken")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const interesting = await Interesting.find()
    res.json(interesting)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/", CheckAdmin, ValidateBody(InterestingJoi), async (req, res) => {
  try {
    const { name } = req.body
    const newInterest = new Interesting({
      name,
    })
    await newInterest.save()
    res.json(newInterest)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.put("/:id", CheckAdmin, CheckId, ValidateBody(InterestingJoi), async (req, res) => {
  try {
    const interest = await Interesting.findById(req.params.id)
    if (!interest) return res.status(404).json("The Interest Not found")
    const { name } = req.body
    const editInterest = await Interesting.findByIdAndUpdate(interest, { $set: { name } }, { new: true })
    res.json(editInterest)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.delete("/:id", CheckAdmin, CheckId, async (req, res) => {
  try {
    const interest = await Interesting.findById(req.params.id)
    if (!interest) return res.status(404).json("The Interest Not found")
    await Interesting.findByIdAndDelete(interest)
    res.json("The Interest Is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/profile-interesting", checkToken, ValidateBody(interestingprofile), async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const { interesting } = req.body
    const interestSet = new Set(interesting)
    if (interestSet.size < interesting.length) return res.status(404).json("There is duplicated Interesting")
    const interestFound = await Interesting.find({ _id: { $in: interesting } })
    if (interestFound.length < interesting.length) return res.status(404).json("There are some Interest Missing")
    const userFound = await User.findByIdAndUpdate(
      user,
      { $addToSet: { interesting: interesting } },
      { new: true }
    ).select("-password")
    res.json(userFound)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.put("/profile/interesting", checkToken, ValidateBody(interestingprofile), async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const { interesting } = req.body
    const interestSet = new Set(interesting)
    if (interestSet.size < interesting.length) return res.status(404).json("There is duplicated Interesting")
    const interestFound = await Interesting.find({ _id: { $in: interesting } })
    if (interestFound.length < interesting.length) return res.status(404).json("There are some Interest Missing")
    const userFound = await User.findByIdAndUpdate(user, { $set: { interesting: interesting } }, { new: true }).select(
      "-password"
    )
    if (!userFound) return res.status(404).json("The Interesting Not Found")
    res.json(userFound)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.delete("/profile-interesting/:id", CheckId, checkToken, async (req, res) => {
  try {
    const interestFound = await Interesting.findById(req.params.id)
    if (!interestFound) return res.status(404).json("The Interesting Not Found")
    await User.findByIdAndUpdate(req.userId, { $pull: { interesting: req.params.id } })
    res.send("The Interest is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
