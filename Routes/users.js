const express = require("express")
const {
  User,
  UserSignupJoi,
  UserLoginJoi,
  profileJoi,
  UserAdminSignupJoi,
  ResumeJoi,
  summaryJoi,
} = require("../Models/User")
const { Company, CompanyLoginJoi, CompanySignupJoi } = require("../Models/Company")
const ValidateBody = require("../middleware/ValidateBody")
const Jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const checkToken = require("../middleware/CheckToken")
const CheckId = require("../middleware/CheckId")
const CheckAdmin = require("../middleware/CheckAdmin")
const Visitor = require("../Models/Visitor")
const AdminAndCompany = require("../middleware/CheckAdminAndCompany")
const { ApplyJob } = require("../Models/ApplyJob")
const { Job } = require("../Models/Job")
const { Skill, SkillsJoi } = require("../Models/Skills")
const { educationJoi, Education, educationEditJoi } = require("../Models/Education")
const { Post } = require("../Models/Post")
const nodemailer = require("nodemailer")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .populate("profileWatch")
      .populate({
        path: "JobsApply",
        populate: {
          path: "jobId",
          select: "title description poster owner",
          populate: {
            path: "owner",
            select: "companyName avatar",
          },
        },
      })
      .populate("Work")
      .populate({
        path: "followwnig",
        select: "firstName lastName avatar",
      })
      .populate({
        path: "followers",
        select: "firstName lastName avatar",
      })
      .populate("Education")
      .populate("skills")
      .populate("Certificates")
      .populate("Experience")
      .populate("interesting")
      .populate({
        path: "posts",
      })
    res.json(users)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/signup-admin", CheckAdmin, ValidateBody(UserAdminSignupJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, role } = req.body
    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).json("You Already registeres")
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = new User({
      firstName,
      lastName,
      password: hash,
      email,
      avatar,
      role: "Admin",
      emailVerified: true,
    })
    await user.save()
    delete user._doc.password
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/signup", ValidateBody(UserSignupJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, Certificates, skills, Experience, Education, work } = req.body
    const userFound = await User.findOne({ email })
    if (userFound) return res.status(400).json("You Already registeres")
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = new User({
      firstName,
      lastName,
      password: hash,
      email,
      avatar,
      emailVerified: true,
    })
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.SENDER_EMAIL,
    //     pass: process.env.SENDER_PASSWORD,
    //   },
    // })
    // const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "16d" })
    // await transporter.sendMail({
    //   from: `"Mohammed Dukhaykh"  <${process.env.SENDER_EMAIL}>`,
    //   to: email, // list of receivers
    //   subject: "email check", // Subject line
    //   html: `We want to steal you Click here to confirm your theft.
    //   <a href="http://localhost:3000/email_verified/${token}">verify user </a>`, // html body
    // })

    await user.save()
    delete user._doc.password
    res.json("The Account is Created")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
// router.get("/email_verified/:token", async (req, res) => {
//   try {
//     const decrypted = Jwt.verify(req.params.token, process.env.JWT_SECRET_KEY)
//     const userId = decrypted.id
//     const user = await User.findByIdAndUpdate(userId, { $set: { emailVerified: true } })
//     if (!user) return res.status(404).send("User not found")
//     res.send("User Verified")
//   } catch (error) {
//     console.log(error)
//     res.status(500).json(error.message)
//   }
// })

router.post("/login", ValidateBody(UserLoginJoi), async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json("You have to Registeres")
    const passwordFound = await bcrypt.compare(password, user.password)
    if (!passwordFound) return res.status(400).json("Incorrect password")
    // if (!user.emailVerified) return res.status(403).send("User not Verify , please Check Your Email")
    const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "16d" })
    res.send(token)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.post("/login-admin", ValidateBody(UserLoginJoi), async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json("You have to Registeres")
    if (user.role != "Admin") return res.status(401).json("UnAuthorization Action")
    const passwordFound = await bcrypt.compare(password, user.password)
    if (!passwordFound) return res.status(400).json("Incorrect password")
    // if (!user.emailVerified) return res.status(403).send("User not Verify , please Check Your Email")
    const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "16d" })
    res.send(token)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.get("/profile", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password -__v")
      .populate({
        path: "JobsApply",
        select: "-__v",
        populate: {
          path: "jobId",
          select: "-usersApply",
          populate: {
            path: "owner",
            select: "companyName",
          },
        },
      })
      .populate("skills")
      .populate({
        path: "Work",
        populate: {
          path: "jobs",
        },
        populate: {
          path: "HR",
          select: "firstName lastName email avatar ",
        },
      })
      .populate("Education")
      .populate("Experience")
      .populate("Certificates")
      .populate("interesting")
      .populate("Resume")
      .populate("followwnig")
      .populate("followers") 
      .populate ({
        path : "profileWatch" ,
        populate : {
          path : "visitor"
        }
      })
      .populate("jobInterest")
      .populate("posts")
    if (!user) return res.status(404).send("The user not Found")
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.get("/profile/:id", checkToken, CheckId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v -JobsApply").populate("profileWatch")
    if (!user) return res.status(404).json("The user Not found")
    if (req.params.id === req.userId) return res.json(user)
    const visitFound = user.profileWatch.find(visit => visit.visitor == req.userId)
    let userVisit
    if (!visitFound) {
      const visit = new Visitor({
        visitor: req.userId,
        date: Date.now(),
      })
      await visit.save()
      userVisit = await User.findByIdAndUpdate(req.params.id, { $push: { profileWatch: visit._id } }, { new: true })
      res.json(userVisit)
    } else {
      userVisit = await Visitor.findByIdAndUpdate(visitFound._id, { $set: { date: Date.now() } }, { new: true })
      res.json(userVisit)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.get("/:id/follow", checkToken, CheckId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json("The user Not found")

    const userFound = user.followers.find(follow => follow == req.userId)

    if (!userFound && req.params.id != req.userId) {
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.userId } }, { new: true })
      await User.findByIdAndUpdate(req.userId, { $push: { followwnig: req.params.id } }, { new: true })
      res.json("The User is Followwing")
    } else {
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.userId } }, { new: true })
      await User.findByIdAndUpdate(req.userId, { $pull: { followwnig: req.params.id } }, { new: true })
      res.json("The User is UnFollow")
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.put("/profile", checkToken, ValidateBody(profileJoi), async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json("The user Not found")
    const { firstName, lastName, password, avatar, Work } = req.body
    let hash
    if (password) {
      const salt = await bcrypt.genSalt(10)
      hash = await bcrypt.hash(password, salt)
    }
    const userEdit = await User.findByIdAndUpdate(
      req.userId,
      { $set: { firstName, lastName, password: hash, avatar ,  Work } },
      { new: true }
    )
    delete userEdit._doc.password
    res.json(userEdit)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.delete("/:id", CheckAdmin, CheckId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).send("User not found")
    if (user.role === "Admin") return res.status(400).json("UnAuthorization Action")
    await User.findByIdAndDelete(user)
    const applyJobFound = await ApplyJob.find({ owner: req.params.id })
    const companyfound = applyJobFound.map(company => company._id)
    const editCompany = companyfound.map(company =>
      Job.updateMany({ usersApply: company }, { $pull: { usersApply: company } })
    )
    await Promise.all(editCompany)
    await ApplyJob.deleteMany({ owner: req.params.id })
    await User.updateMany({ followers: req.params.id }, { $pull: { followers: req.params.id } })
    await User.updateMany({ followwnig: req.params.id }, { $pull: { followwnig: req.params.id } })
    await User.updateMany({ profileWatch: req.params.id }, { $pull: { profileWatch: req.params.id } })
    await Company.updateMany({ CEO: req.params.id }, { $set: { CEO: null } })
    await Company.updateMany({ $in: { HR: req.params.id } }, { $pull: { HR: req.params.id } })
    await Company.updateMany({ $in: { Users: req.params.id } }, { $pull: { Users: req.params.id } })
    await Post.deleteMany({ ownerUser: req.params.id })
    res.json("The User is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.post("/resume", checkToken, ValidateBody(ResumeJoi), async (req, res) => {
  try {
    const { resume } = req.body
    const user = await User.findByIdAndUpdate(req.userId, { Resume: resume }, { new: true })
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.put("/resume", checkToken, ValidateBody(ResumeJoi), async (req, res) => {
  try {
    const { resume } = req.body
    const user = await User.findByIdAndUpdate(req.userId, { $set: { Resume: resume } }, { new: true })
    if (!user) return res.status(404).json("The Resume Not Found")
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.post("/summary", checkToken, ValidateBody(summaryJoi), async (req, res) => {
  try {
    const { summary } = req.body
    await User.findByIdAndUpdate(req.userId, { $set: { summary } })
    res.send("Your add Summary")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
