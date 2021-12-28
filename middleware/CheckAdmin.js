const Jwt = require("jsonwebtoken")
const { User } = require("../Models/User")

const CheckAdmin = async (req, res , next) => {
  try {
    const token = req.header("Authorization")
    if (!token) return res.status(401).send("You Nedd Token")
    const decrypted = Jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decrypted.id
    const user = await User.findById(userId)
    if (!user) return res.status(404).send("User not found")
    if (user.role !== "Admin") return res.status(403).json("Should be Admin to Action")
    req.userId = userId
    next()
  } catch (error) {
    console.log(error)
    res.status(500).json(error.message)
  }
}

module.exports = CheckAdmin
