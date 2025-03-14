import { body, validationResult } from "express-validator"

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, err) => {
            acc[err.path] = err.msg;
            return acc;
        }, {});
        return res.status(400).json({
            message: "Errores de validación",
            errors: formattedErrors,
            success: false
        });
    }
    next();
}

export const validateRegister = [
    body('name')
        .exists().withMessage("El nombre es obligatorio")
        .bail()
        .isString().notEmpty().withMessage("El nombre no puede estar vacio"),
    body('surname').isString().withMessage("El surname es invalido"),
    body('username').isString().notEmpty().withMessage("El username es obligatorio"),
    handleValidationErrors
]


export const validateLogin = [
    body('email')
        .exists().withMessage("El email es obligatorio")
        .bail()
        .isString().notEmpty().withMessage("El email no puede estar vacio"),
    body('password')
        .exists().withMessage("El password es obligatorio")
        .notEmpty().withMessage("El password no puede estar vacio"),
    handleValidationErrors
]

