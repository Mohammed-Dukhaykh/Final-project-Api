const express = require("express")
const checkToken = require("../middleware/CheckToken")
const CheckCompany = require("../middleware/CheckCompany")
const { User, UserSignupJoi, UserLoginJoi } = require("../Models/User")
const { Company, CompanyLoginJoi, CompanySignupJoi } = require("../Models/Company")
const ValidateBody = require("../middleware/ValidateBody")
const Jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const CheckAdminCompany = require("../middleware/CheckAdminCompany")
const CheckId = require("../middleware/CheckId")
const { populate, deleteMany } = require("../Models/Visitor")
const { ApplyJob } = require("../Models/ApplyJob")
const { Job } = require("../Models/Job")
const CheckCEO = require("../middleware/CheckCEO")
const { Post } = require("../Models/Post")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const company = await Company.find()
      .select("-password -commenicalNumber")
      .populate({
        path: "CEO",
        select: "firstName lastName avatar",
      })
      .populate({
        path: "HR",
        select: "firstName lastName avatar",
      })
      .populate({
        path: "Users",
        select: "firstName lastName avatar",
      })
      .populate("posts")
      .populate({
        path: "jobs",
        populate: "usersApply",
      })
    res.json(company)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/Add", checkToken, ValidateBody(CompanySignupJoi), async (req, res) => {
  try {
    const { companyName, email, password, avatar, commenicalNumber } = req.body
    const allCompany = await Company.findOne({ CEO: req.userId, HR: req.userId, Users: req.userId })
    const companyFound = await Company.findOne({ email })
    if (allCompany || companyFound) return res.status(400).json("You Already Have Account")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const newCompany = new Company({
      companyName,
      email,
      password: hash,
      avatar,
      commenicalNumber,
      CEO: req.userId,
    })
    await User.findByIdAndUpdate(req.userId, { Work: newCompany._id })
    await newCompany.save()
    delete newCompany._doc.password
    res.send(newCompany)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.get("/profile", CheckCompany, async (req, res) => {
  try {
    const userFound = await User.findById(req.userId)
    const companyFound = userFound.Work
    const company = await Company.findById(companyFound)
      .select("-password -__v ")
      .populate({
        path: "jobs",
        select: "-__v -owner",

        populate: {
          path: "usersApply",
          select: "-jobId -__v",
        },
      })
      .populate({
        path: "HR",
        select: "-__v -password -role -Work -JobsApply ",
      })
      .populate({
        path: "CEO",
        select: "-__v -password -role -Work -JobsApply ",
      })
    if (!company) return res.status(404).send("The company not Found")
    res.json(company)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/add-HR/:id", CheckCEO, checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).send("User not found")
    const foundCompany = await User.findById(req.userId)
    const company = foundCompany.Work
    const foundUser = await Company.findById(company)
    const checkWork = user.Work
    const checkUser = foundUser.Users.includes(req.params.id.toString())
    const checkHr = foundUser.HR.includes(req.params.id.toString())
    if (checkUser || checkHr || checkWork) return res.status(400).json("The User already employee in company")
    const AddHr = await Company.findByIdAndUpdate(company, { $push: { HR: req.params.id } }, { new: true })
    await User.findByIdAndUpdate(req.params.id, { $set: { Work: company } })
    res.json(AddHr)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/add-users/:id", CheckCompany, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).send("User not found")
    const userFound = await User.findById(req.userId)
    const company = userFound.Work
    const foundCompany = await Company.findById(company)
    const checkUser = foundCompany.Users.includes(req.params.id.toString())
    const checkHr = foundCompany.HR.includes(req.params.id.toString())
    if (checkUser || checkHr) return res.status(400).json("The User already employee in company")
    const companyUpdate = await Company.findByIdAndUpdate(company, { $push: { Users: req.params.id } }, { new: true })
    await User.findByIdAndUpdate(req.params.id, { $set: { Work: company } })
    res.json(companyUpdate)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.delete("/delete-HR/:id", CheckId, CheckCEO, async (req, res) => {
  try {
    const Ceo = await User.findById(req.userId)
    const company = Ceo.Work
    const userCompany = await Company.findOne({ HR: req.params.id })
    if (!userCompany) return res.status(404).json("The User Not Found In company")
    if (userCompany._id !== company) return res.status(403).json("UnAuthorization Action")
    const editCompany = await Company.findByIdAndUpdate(company, { $pull: { HR: req.params.id } }, { new: true })
    res.json(editCompany)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.delete("/:id", CheckId, CheckAdminCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
    if (!company) return res.status(404).send("The Company not Found")
    const userFound = await User.findById(req.userId)
    if (userFound.role !== "Admin" && company.CEO.toString() != req.userId.toString())
      return res.status(403).json("UnAuthorization aa Action")
    await Company.findByIdAndDelete(req.params.id)
    const jobFound = await Job.find({ owner: req.params.id })
    const jobId = jobFound.map(jobObject => jobObject._id)
    const applySearch = await ApplyJob.find({ jobId: { $in: jobId } })
    const updateUser = applySearch.map(apply =>
      User.updateMany({ JobsApply: apply._id }, { $pull: { JobsApply: apply._id } })
    )
    await Promise.all(updateUser)
    await Job.deleteMany({ owner: company })
    await User.updateMany({ Work: req.params.id }, { $set: { Work: null } })
    await Post.deleteMany({ ownerCompany: req.params.id })
    res.json("The Company is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
