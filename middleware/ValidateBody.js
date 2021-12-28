const ValidateBody = elementJoi => {
    return async (req , res , next) => {
        const result = elementJoi.validate(req.body)
        if (result.error) return   res.status(400).json(result.error.details[0].message)
        next()
    }
}

module.exports = ValidateBody