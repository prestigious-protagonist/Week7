
const ClientError = require('../utils/client-error');
const {StatusCodes} = require('http-status-codes')
const validateUserAuth = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ClientError({
                name: "ValidationError",
                message: "Invalid Request",
                explanation: "Email or password is missing from the request body.",
                statusCode: StatusCodes.BAD_REQUEST, // Use 400 for validation errors
            });
        }
        next();
    } catch (error) {
        next(error);  // Forward the error to the error handler
    }
};



const validateIsAdminRequest = (req, res, next) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ClientError({
            name: "ValidationError",
            message: "Invalid Request",
            explanation: "field userId is missing from the request body.",
            statusCode: StatusCodes.BAD_REQUEST,
        });
    }
    next();
};

const validateLogin = (req, res, next) => {
    try {
        if (!req.signedCookies.token) {
            throw new ClientError({
                name: "AuthenticationError",
                message: "Unauthorized",
                explanation: "User is not signed in.",
                statusCode: StatusCodes.UNAUTHORIZED,
            }); 
        }
        next();
    } catch (error) {
        next(error)
    }
   
};

const validateForgotPassRequest = (req, res, next) => {
    const { email } = req.query;
    if (!email) {
        throw new ClientError({
            name: "ValidationError",
            message: "Invalid Request",
            explanation: "Email field is missing from the request body.",
            statusCode: StatusCodes.BAD_REQUEST,
        });
    }
    next();
};

const validateResetPassRequest = (req, res, next) => {
    //get userId by email as we dont expect the
    const { id, otp, password } = req.body;
    if (!id || !otp || !password ) {
        throw new ClientError({
            name: "ValidationError",
            message: "Invalid Request",
            explanation: "One or more required fields are missing from the request body.",
            statusCode: StatusCodes.BAD_REQUEST,
        });
    }
    
    next();
};

module.exports = {
    validateUserAuth,
    validateIsAdminRequest,
    validateLogin,
    validateForgotPassRequest,
    validateResetPassRequest
}