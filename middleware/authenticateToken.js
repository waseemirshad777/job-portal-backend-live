const jwt = require('jsonwebtoken');
const jwtSeceretKey = "wasim@467";// Use the same secret key as above

function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unathorized.' });
    }

    try {
        const decoded = jwt.verify(token, jwtSeceretKey);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Invalid token.' });
    }
}

module.exports = authenticateToken;
