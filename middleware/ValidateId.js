const mongoose = require("mongoose")
const ValidateId = (...arrayId) => {
    return async (req, res, next) => {
      try {
        arrayId.forEach(nameId => {
          const id = req.params[nameId]
          if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json(`The path ${nameId} is not objectId`)
        })
        next()
      } catch (error) {
        console.log(error)
        res.status(500).json(error.message)
      }
    }
  }

  module.exports = ValidateId