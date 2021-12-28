const express = require("express")
const mongoose = require("mongoose")
const Joi = require("joi")
const joiObjectid = require("joi-objectid")
const users = require("./Routes/users")
const jobs = require("./Routes/jobs")
const company = require("./Routes/company")
Joi.ObjectId = joiObjectid(Joi)
const skills = require("./Routes/skills")
const interesting = require("./Routes/interesting")
const education = require("./Routes/education")
const experience = require("./Routes/experience")
const certificates = require("./Routes/certificates")
const posts = require("./Routes/posts")

require("dotenv").config()
const cors = require("cors")


mongoose
  .connect("mongodb://localhost:27017/finalProjectTest")
  .then(() => console.log("Mongoose is Connected"))
  .catch(error => {
    console.log("The error is", error)
  })

const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/auth" , users)
app.use("/api/jobs" , jobs )
app.use("/api/company" , company )
app.use("/api/skills" , skills )
app.use("/api/interesting" , interesting )
app.use("/api/education" , education )
app.use("/api/experience" , experience )
app.use("/api/certificates" , certificates )
app.use("/api/posts" , posts )



app.listen(5000 , () => {
  console.log("The server is listening on port" , 5000)
})
