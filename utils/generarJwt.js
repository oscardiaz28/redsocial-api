import jwt from 'jsonwebtoken'


export const generarJwt = ({id, email}) => {
    const payload = {
        id,
        email
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET_WORD, {
        expiresIn: '1h'
    })
    return token
}