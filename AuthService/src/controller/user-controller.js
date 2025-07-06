const UserService = require("../services/user-service");
const AppErrors = require("../utils/error-handler");
const {StatusCodes} = require('http-status-codes')
const ValidationError = require('../utils/validation-error');
const ClientError = require("../utils/client-error");
this.UserService = new UserService();

const create = async (req, res) => {
    try {
        const response = await this.UserService.create({
            email: req.body.email,
            password: req.body.password
        })
        if(!response) {
            throw new AppErrors(
                "UserCreationError", 
                "Failed to create user", 
                "The service could not create the user due to an unknown issue.", 
                StatusCodes.INTERNAL_SERVER_ERROR 
            );
        }
        res.cookie("token", response.dataValues.token, { 
            httpOnly: true,
            signed: true,   
            sameSite: 'None',      
            secure: false, 
         });
        return res.status(StatusCodes.CREATED).json({
            message:"Successfully created a new User",
            data:response,
            success: true,
            err: {}
        })
    } catch (error) {
        if (!(error instanceof AppErrors || error instanceof ClientError)) {
            // If it's not an instance of AppError, it's an unexpected error
            error = new AppErrors();
        }
        return res.status(error.statusCode).json({
            err: error.name,
            message:error.message,
            data:error.explanation,
            success: error.success,
            
        })
    }
}

const signIn = async (req, res) => {
    try {
        const response = await this.UserService.signIn({
            email: req.body.email,
            password: req.body.password
        })
        res.cookie("token", response, { 
            httpOnly: true,
            signed: true,   
            sameSite: 'None',      
            secure: false, 
         });
        return res.status(StatusCodes.OK).json({
            message:"Successfully Signed In",
            data:response,
            success: true,
            err: {}
        })
    } catch (error) {
        
        if (!(error instanceof AppErrors || error instanceof ClientError)) {
            // If it's not an instance of AppError, it's an unexpected error
            error = new AppErrors();
        }
    
        return res.status(error.statusCode).json({
            err: error.name,
            message: error.message,
            data: error.explanation,
            success: error.success,
        });
    }
}

const isAuthenticated = async (req, res) => {
    try {
        const token = req.signedCookies['token']
        const response =await this.UserService.isAuthenticated(token);
        
        return res.status(StatusCodes.OK).json({
            message:"User is Autheticated and token is valid.",
            data: response,              
            success: true,
            err: {}
        })
    } catch (error) {
        if (!(error instanceof AppErrors || error instanceof ClientError)) {
            // If it's not an instance of AppError, it's an unexpected error
            error = new AppErrors();
        }
        return res.status(error.statusCode).json({
            err: error.name,
            message:error.message,
            data:error.explanation,
            success: error.success,
            
        })
    }
}
const logout = async (req, res) => {
    try {
        // an autehnticated user can only be logged out
        // logic to check for only cookies isnt sufficient, we must also check for its authenticity
        if(!req.signedCookies['token'] || !req) {
            throw {err: 'no user logged in'};
        }
        const isVerified = await this.UserService.isAuthenticated(req.signedCookies['token']);
        
        if(!isVerified) {
            throw {error: 'Invalid cookie'}
        }
        res.clearCookie('token');
        return res.status(200).json({
            message:"User logged out.",
            data: "None",
            success: true
        })
    } catch (error) {
        if (!(error instanceof AppErrors || error instanceof ClientError)) {
            // If it's not an instance of AppError, it's an unexpected error
            error = new AppErrors();
        }
        return res.status(error.statusCode).json({
            err: error.name,
            message:error.message,
            data:error.explanation,
            success: error.success,
            
        })
    }
}
const isAdmin = async (req, res) => {
    try {
        const response = await this.UserService.isAdmin(req.params.userId);
        if(!response) {
            throw error;
        }
        return res.status(200).json({
            message:"User is an Admin.",
            data: "UID: "+ req.params.userId,
            success: true
        })
    } catch (error) {
        if (!(error instanceof AppErrors || error instanceof ClientError)) {
            // If it's not an instance of AppError, it's an unexpected error
            error = new AppErrors();
        }
        return res.status(error.statusCode).json({
            err: error.name,
            message:error.message,
            data:error.explanation,
            success: error.success,
            
        })
    }
}


const forgotPass = async (req, res) => {
    try {
       
        const response = await this.UserService.generateOTP(req.query);
       
        if(!response) {
            throw error;
        }
        return res.status(StatusCodes.OK).json({
            message:`Generated encrypted token for user with email: ${req.query.email}`,
            data: response,
            success: true
        })
    } catch (error) {
        if (!(error instanceof AppErrors || error instanceof ClientError)) {
            // If it's not an instance of AppError, it's an unexpected error
            error = new AppErrors();
        }
        return res.status(error.statusCode).json({
            err: error.name,
            message:error.message,
            data:error.explanation,
            success: error.success,
            
        })
    }
}

const resetPass = async (req, res) => {
    try {
       //   accepts id otp pass as input and confirm pass
       //u'll get id from response of /forgotPass endpt
       
        const response = await this.UserService.resetPass(req.body);
       
        if(!response) {
            throw error;
        }
        return res.status(200).json({
            message:`Password updated successfully for user with id: ${req.body.id}`,
            data: response,
            success: true
        })
    } catch (error) {
        if (!(error instanceof AppErrors || error instanceof ClientError)) {
            // If it's not an instance of AppError, it's an unexpected error
            error = new AppErrors();
        }
        return res.status(error.statusCode).json({
            err: error.name,
            message:error.message,
            data:error.explanation,
            success: error.success,
            
        })
    }
}

module.exports = {
    create,
    signIn,
    isAuthenticated,
    isAdmin,
    logout,
    forgotPass,
    resetPass

}