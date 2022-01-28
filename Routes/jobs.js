const express = require("express")
const { Job, jobJoi, jobEditJoi } = require("../Models/Job")
const ValidateBody = require("../middleware/ValidateBody")
const { ApplyJobJoi, ApplyJob, jobProgress } = require("../Models/ApplyJob")
const CheckId = require("../middleware/CheckId")
const { User } = require("../Models/User")
const ValidateId = require("../middleware/ValidateId")
const CheckCompany = require("../middleware/CheckCompany")
const { Company } = require("../Models/Company")
const checkToken = require("../middleware/CheckToken")
const nodemailer = require("nodemailer")
const CheckAdminCompany = require("../middleware/CheckAdminCompany")
const { Question, QuestionJoi } = require("../Models/Question")
const { Answer } = require("../Models/Answer")
const { populate } = require("../Models/Visitor")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find()
      .select(" -__v")
      .populate({
        path: "owner",
        select: "companyName _id avatar ",
      })
      .populate({
        path: "usersApply",
        populate: {
          path: "owner",
          select: "avatar firstName lastName",
        },
      })
      .populate({
        path: "usersApply",
        populate: {
          path: "answers",
          populate: "question",
        },
      })
      .populate({
        path: "usersApply",
        populate: {
          path: "skills",
        },
      })
      .populate("questions")
      .populate("jobField")
    res.json(jobs)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.get("/:jobId", ValidateId("jobId"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
    if (!job) return res.status(404).json("The Job Not Found")
    res.json(job)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.get("/company-job/:companyId", ValidateId("companyId"), async (req, res) => {
  try {
    if (!req.params.companyId) return res.status(404).json("The Company Not Found")
    const company = await Job.find({ owner: req.params.companyId })
    if (!company) return res.status(404).json("The Jobs Not Found")
    res.json(company)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/", CheckCompany, ValidateBody(jobJoi), async (req, res) => {
  try {
    const { title, description, poster, job, jobField } = req.body
    const companyFound = await User.findById(req.userId)
    const company = companyFound.Work
    const jobFound = new Job({
      title,
      description,
      poster,
      owner: company,
      employeeId: req.userId,
      jobField,
    })
    await jobFound.save()

    await Company.findByIdAndUpdate(company, { $push: { jobs: jobFound._id } })

    res.json(jobFound)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.post("/add-question/:jobId", CheckCompany, ValidateId("jobId"), ValidateBody(QuestionJoi), async (req, res) => {
  const { question } = req.body
  const job = await Job.findById(req.params.jobId)
  if (!job) return res.status(404).send("The job not Found")
  const userFound = await User.findById(req.userId)
  if (userFound.Work.toString() != job.owner) return res.status(403).json("UnAuthorization Action")
  const questionBody = new Question({
    question,
  })
  await questionBody.save()
  await Job.findByIdAndUpdate(job, { $push: { questions: questionBody._id } }, { new: true })
  res.json(job)
})
router.put("/:jobId", CheckAdminCompany, ValidateBody(jobEditJoi), ValidateId("jobId"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
    if (!job) return res.status(404).send("The job not Found")
    const userFound = await User.findById(req.userId)
    const { title, description, poster } = req.body
    if (userFound.role == "Admin" || job.owner.toString() === userFound.Work) {
      const jobEdit = await Job.findByIdAndUpdate(
        req.params.jobId,
        { $set: { title, description, poster } },
        { new: true }
      )
      res.json(jobEdit)
    } else {
      res.status(403).json("Unauthorization Action")
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.post("/apply/:id", CheckId, ValidateBody(ApplyJobJoi), checkToken, async (req, res) => {
  try {
    const { firstName, lastName, email, skills, Qualification, answers = [], ResumeCv, phoneNumber } = req.body
    const job = await Job.findById(req.params.id).populate("usersApply")
    if (!job) return res.status(404).send("The job not Found")
    const userFound = await User.findById(req.userId)
    const emailFound = userFound.email
    const jobFound = job.usersApply.find(oneJob => oneJob.owner == req.userId)
    if (jobFound) return res.status(400).json("You already Applyed this job")

    const questionFound = answers.map(answer => answer.question)
    const questionSet = new Set(questionFound)
    if (questionSet.size < questionFound) return res.status(404).json("There is duplicated question")
    if (answers.length < job.questions.length) return res.status(400).send("Should Answer all Questions")
    const newAnswer = answers.map(
      answer =>
        new Answer({
          answer: answer.answer,
          question: answer.question,
        })
    )

    // return console.log("hhhh", newAnswer)
    const answerPromise = newAnswer.map(answer => answer.save())
    await Promise.all(answerPromise)
    const answerId = newAnswer.map(answer => answer._id)

    const jobBody = new ApplyJob({
      firstName: userFound.firstName,
      lastName: userFound.lastName,
      email: emailFound,
      skills,
      jobId: req.params.id,
      owner: req.userId,
      ResumeCv,
      phoneNumber: phoneNumber,
      answers: answerId,
    })

    await jobBody.save()

    await Job.findByIdAndUpdate(req.params.id, { $push: { usersApply: jobBody._id } }, { new: true })
    await User.findByIdAndUpdate(req.userId, { $push: { JobsApply: jobBody._id } }, { new: true })

    res.json(jobBody)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

router.put(
  "/:jobId/:applyId",
  ValidateId("jobId", "applyId"),
  ValidateBody(jobProgress),
  CheckCompany,
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.jobId).populate("owner")
      if (!job) return res.status(404).send("The job not Found")
      const applyId = await ApplyJob.findById(req.params.applyId)

      if (!applyId) return res.status(404).send("The request was not found")
      const userOwner = await User.findById(applyId.owner)
      const userFound = job.usersApply.find(jobObject => jobObject == req.params.applyId)
      if (!userFound) return res.status(404).send("The request was not found in this job")

      //comment Id
      const user = await User.findById(req.userId)
      if (userOwner._id.toString() == user._id) return res.json("UnAuthorization  Action")
      if (job.owner._id.toString() != user.Work) return res.status(403).json("Unauthorization Action")
      const { progress } = req.body

      const newProgress = await ApplyJob.findByIdAndUpdate(
        req.params.applyId,
        { $set: { progress: progress } },
        { new: true }
      )
      // if (progress == "Accept") {
      //   const transporter = nodemailer.createTransport({
      //     service: "gmail",
      //     port: 587,
      //     secure: false,
      //     auth: {
      //       user: "Test3705968@gmail.com",
      //       pass: "MoHmmaD3705968aSd$",
      //     },
      //   })
      //   await transporter.sendMail({
      //     from: '"Mohammed Dukhaykh" <Test3705968@gmail.com>', // sender address
      //     to: userOwner.email, // list of receivers
      //     subject: `Job Update ${job.title} `, // Subject line
      //     html: `dear ${userOwner.firstName} ${userOwner.lastName} Congratulations, you have been initially accepted into a job
      //     ${job.title} in ${job.owner.companyName} and we will contact you to schedule an interview ${job.owner.companyName} Team `, // html body
      //   })
      //   res.json(newProgress)
      // } else if (progress == "No Accept") {
      //   const transporter = nodemailer.createTransport({
      //     service: "gmail",
      //     port: 587,
      //     secure: false,
      //     auth: {
      //       user: "Test3705968@gmail.com",
      //       pass: "MoHmmaD3705968aSd$",
      //     },
      //   })
      //   await transporter.sendMail({
      //     from: '"Mohammed Dukhaykh" <Test3705968@gmail.com>', // sender address
      //     to: userOwner.email, // list of receivers
      //     subject: `Job Update ${job.title}`, // Subject line
      //     html: `dear ${userOwner.firstName} ${userOwner.lastName} , thank you for showing interest in joining ${job.owner.companyName}.
      //     Following the best in class recruitment methods for selection, we followed strict methods and procedures where we continuously rank candidates based on a number of
      //     factors and criteria. Candidates go through a number of steps before we make our selection to the next step
      //     It was very difficult for us to make the selection. Regretfully, we would like to inform you that we have
      //     decided to pursue more suitable candidates for ${job.title}
      //     best Regards ${job.owner.companyName} Team. `, // html body
      //   })
        res.json(newProgress)
      // }
    } catch (error) {
      console.log(error)
      res.status(500).json(error.message)
    }
  }
)

router.delete("/:id", CheckAdminCompany, CheckId, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) return res.status(404).send("The job not Found")
    const userFound = await User.findById(req.userId)
    if (userFound.role === "Admin" || job.owner.toString() == userFound.Work) {
      await Job.findByIdAndDelete(req.params.id)
      await ApplyJob.deleteMany({ jobId: req.params.id })
      const applyFound = await ApplyJob.find({ jobId: req.params.id })
      const userUpdate = applyFound.map(applyId =>
        User.updateMany({ JobsApply: applyId._id }, { $pull: { JobsApply: applyId._id } })
      )
      await Promise.all(userUpdate)
      await User.updateMany({ jobInterest: req.params.id }, { $pull: { jobInterest: req.params.id } })
      res.json("The job is Delete")
    } else {
      res.status(403).json("failed")
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.get("/interest/:jobId", checkToken, ValidateId("jobId"), async (req, res) => {
  try {
    const jobFound = await Job.findById(req.params.jobId)
    if (!jobFound) return res.status(404).send("The job not Found")
    const userFound = await User.findById(req.userId)
    const interestFound = userFound.jobInterest.find(interest => interest.toString() === jobFound._id.toString())

    if (!interestFound) {
      await User.findByIdAndUpdate(req.userId, { $push: { jobInterest: jobFound._id } }, { new: true })
      res.json("Job is Added to interest Jobs")
    } else {
      await User.findByIdAndUpdate(req.userId, { $pull: { jobInterest: jobFound._id } }, { new: true })
      res.json("The Job is remove from interest jobs")
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
