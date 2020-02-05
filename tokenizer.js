var jwt = require('jsonwebtoken');

const SECRET_KEY = '192374019474738947';
const EXPIRE_TIME = '6h'

// Esta función firma el objeto 'objectToTokenize' y retorna la firma.
const sign = (objectToTokenize) => {
    const signOptions = { expiresIn: EXPIRE_TIME };
    return jwt.sign( objectToTokenize, SECRET_KEY, signOptions );
}

// Este es un middleware utilizado para comprobar si el token
// recibido es válido. En caso de ser válido, llama a next().
const check = (req, res, next) => {
    // Si no tiene autorización, termina.
    if(!req.headers.authorization) {
        return res.status(400).json({ message: 'Authorization needed.' })
    }

    try {
        // Obtiene el token desde el header.
        // Aquí asumimos que la autorización tiene la siguiente forma: 'Bearer eyJhb...r98A'
        const token = req.headers.authorization.split(' ')[1];

        // Comprueba si la secret key es capaz de decodificar dicho token.
        // En caso de no conseguirlo, esta función largará un error, entrando en el catch.
        jwt.verify(token, SECRET_KEY);

        // Si todo ha salido bien, sigue con la siguiente etapa:
        next();
    } catch(err) {
        return res.status(401).json({ message: 'Invalid token.' })
    }
};

exports.sign = sign;
exports.check = check;