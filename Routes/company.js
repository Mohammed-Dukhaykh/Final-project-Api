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
        select: "-isCEO -jobInterest -Work -JobsApply -isHR -password -emailVerified",
      })
      .populate({
        path: "Users",
        select: "-isCEO -jobInterest -Work -JobsApply -isHR -password -emailVerified",
      })
      .populate("posts")
      .populate({
        path: "jobs",
        populate: {
          path: "usersApply",
          populate: {
            path: "skills",
          },
        },
      })
      .populate({
        path: "jobs",
        populate: {
          path: "employeeId",
        },
      })
    //   .populate({
    //     path: "jobs",
    //     populate : {
    //       path : "usersApply"
    //     },
    //   populate : {
    //     path : "employeeId" ,
    //     select : "firstName lastName email avatar"
    //   }
    // })
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
    if (allCompany) return res.status(400).json("You Already Have Account")
    const newCompany = new Company({
      companyName,
      avatar,
      commenicalNumber,
      CEO: req.userId,
    })
    await User.findByIdAndUpdate(req.userId, { Work: newCompany._id, isCEO: true })
    await newCompany.save()
    delete newCompany._doc.password
    res.send(newCompany)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/add-HR/:id", CheckCompany, async (req, res) => {
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
    await Company.findByIdAndUpdate(company, { $push: { HR: req.params.id } }, { new: true })
    await User.findByIdAndUpdate(req.params.id, { Work: company, isHR: true })
    res.json("the user is added")
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
    await User.findByIdAndUpdate(req.params.id, { Work: company })
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
    // return console.log(userCompany._id.toString() != company)
    if (userCompany._id.toString() != company) return res.status(403).json("UnAuthorization Action")
    const editCompany = await Company.findByIdAndUpdate(company, { $pull: { HR: req.params.id } }, { new: true })
    await User.findByIdAndUpdate(req.params.id, { $set: { isHR: false, Work: null } })
    res.json(editCompany)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.delete("/delete-users/:id", CheckId, CheckCompany, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json("The User Not Found")
    const userCompany = await Company.findOne({ Users: req.params.id })
    if (req.companyId._id.toString() != userCompany._id) return res.status(403).json("UnAuthorization Action")
    const editCompany = await Company.findByIdAndUpdate(
      req.companyId,
      { $pull: { Users: req.params.id } },
      { new: true }
    )
    await User.findByIdAndUpdate(req.params.id, { $set: { Work: null } })
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
    if (!userFound) return res.status(400).json("The user not Found")
    if (userFound.role !== "Admin" && company.CEO.toString() != req.userId.toString())
      return res.status(403).json("UnAuthorization  Action")
    await Company.findByIdAndDelete(req.params.id)
    const jobFound = await Job.find({ owner: req.params.id })
    const jobId = jobFound.map(jobObject => jobObject._id)
    const applySearch = await ApplyJob.find({ jobId: { $in: jobId } })
    const updateUser = applySearch.map(apply =>
      User.updateMany({ JobsApply: apply._id }, { $pull: { JobsApply: apply._id } })
    )
    await Promise.all(updateUser)
    await Job.deleteMany({ owner: company })
    await User.updateMany({ Work: req.params.id }, { $set: { Work: null, isHR: false, isCEO: false } })
    await Post.deleteMany({ ownerCompany: req.params.id })
    res.json("The Company is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
