const express = require("express")
const checkToken = require("../middleware/CheckToken")
const ValidateBody = require("../middleware/ValidateBody")
const { User } = require("../Models/User")
const { Certificate, CertificatesEditJoi, CertificatesJoi } = require("../Models/Certificates")
const router = express.Router()

router.post("/", checkToken, ValidateBody(CertificatesJoi), async (req, res) => {
  try {
    const { title, authority, certificateFile } = req.body
    const certificateBody = new Certificate({
      title,
      authority,
      certificateFile,
      owner: req.userId,
    })
    await certificateBody.save()
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { Certificates: certificateBody._id } },
      { new: true }
    ).select("-password")
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.put("/", checkToken, ValidateBody(CertificatesEditJoi), async (req, res) => {
  try {
    const { title, authority, certificateFile } = req.body
    const certificateFound = await Certificate.findOneAndUpdate(
      { owner: req.userId },
      { $set: { title, authority, certificateFile } },
      { new: true }
    )
    if (!certificateFound) return res.status(404).json("The Certificate Not Found")
    res.json(certificateFound)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
