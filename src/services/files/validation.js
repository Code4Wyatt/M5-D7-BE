import { checkSchema, validationResult } from "express-validator"

const schema = {
    title: {
        in: ["body"],
        isString: {
            errorMessage: "Title is required and must be a string"
        },
    },
}

export const checkFileSchema = checkSchema(schema)

export const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {  
        const error = new Error("File post validation failed")
        error.status = 400
        error.errors = errors.array()
        next(error)
    }
    next()
}