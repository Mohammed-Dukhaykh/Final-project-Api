const express = require("express")
const checkToken = require("../middleware/CheckToken")
const ValidateBody = require("../middleware/ValidateBody")
const { User } = require("../Models/User")
const { Certificate, CertificatesEditJoi, CertificatesJoi } = require("../Models/Certificates")
const CheckId = require("../middleware/CheckId")
const router = express.Router()

router.post("/", checkToken, ValidateBody(CertificatesJoi), async (req, res) => {
  try {
    const { title, authority } = req.body
    const certificateBody = new Certificate({
      title,
      authority,
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
router.put("/:id", CheckId, checkToken, ValidateBody(CertificatesEditJoi), async (req, res) => {
  try {
    const { title, authority } = req.body
    const certificateFound = await Certificate.findById(req.params.id)
    if (!certificateFound) return res.status(404).json("The Certificate Not Found")
    await Certificate.findByIdAndUpdate(req.params.id, { $set: { title, authority } })
    // const certificateFound = await Certificate.findOneAndUpdate(
    //   { owner: req.userId },
    //   { $set: { title, authority, certificateFile } },
    //   { new: true }
    // )
    res.json(certificateFound)
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})
router.delete("/:id", CheckId, checkToken, async (req, res) => {
  try {
    const certificateFound = await Certificate.findById(req.params.id)
    if (!certificateFound) return res.status(404).json("The Certificate Not Found")
    await Certificate.findByIdAndDelete(req.params.id)
    await User.findByIdAndUpdate(req.userId, { $pull: { Certificates: req.params.id } })
    res.send("The Certificate is Delete")
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
})

module.exports = router
