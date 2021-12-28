const mongoose = require("mongoose")
const CheckId = async (req , res , next) => {
    const id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json("The id must be objectId")
    next()
}

module.exports = CheckId