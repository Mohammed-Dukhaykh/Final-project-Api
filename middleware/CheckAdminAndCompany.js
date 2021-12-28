const Jwt = require("jsonwebtoken")
const { Company } = require("../Models/Company")
const { User } = require("../Models/User")

const AdminAndCompany = async (req, res, next) => {
  try {
    const token = req.header("Authorization")
    if (!token) return res.status(401).send("You Nedd Token")
    const decryptedToken = Jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decryptedToken.id
    const CEO = await Company.findOne({ CEO: userId })
    const user = await User.findById(userId)
    if ( !CEO  && user.role != "Admin") return res.status(403).json("UnAuthorization Action")
    req.userId = userId
    next()
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
}


module.exports = AdminAndCompany
