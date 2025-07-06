const {User} = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {StatusCodes} = require('http-status-codes')
const {JWT_KEY, CRYPTO_KEY} = require('../config/serverConfig');
const UserRepository = require('../repository/user-repository');
const ClientError = require('../utils/client-error')
const AppErrors = require("../utils/error-handler");
const crypto = require("crypto");
const { sendBasicEmail } = require("./email-service");
const {otpstore} = require("../models/index");

class UserService {
    constructor() {
        this.UserRepository = new UserRepository();
    }

    async create(data) {
        try {
            const user = await this.UserRepository.create(data);
            const newJwt = await this.createToken({
                email: user.email,
                id: user.id
            });
            user.dataValues["token"] = newJwt
            return user;
        } catch (error) {
            console.log(error)
            if(error.name == "SequelizeValidationError") {
                throw error;
            }
            
            if(error.name == "SequelizeUniqueConstraintError") {
                throw error;
            }
            throw new AppErrors("ServerError", "Something went wrong in service layer", "Logical issue occured",500, false);
        }
    }
    async createToken(user) {
        try {
            const token = jwt.sign(user, JWT_KEY, {expiresIn: '1h'})
            return token;
        } catch (error) {
            console.log("Something went wrong in the token creation.");
            throw error;
        }
    }

    async verifyToken(token) {
        try {
            
            const response = jwt.verify(token, JWT_KEY);
            return response;
        } catch (error) {
            throw new ClientError({
                    name: "Authentication Failed",
                    message: "Invalid Token",
                    explanation: "Token mismatch/ expired",
                    statusCode: StatusCodes.UNAUTHORIZED, 
                });
            
        }
    }
    async isAuthenticated(token) {
        try {
            const response = await this.verifyToken(token);
            if(!response) {
                throw new ClientError({
                    name: "Authentication Failed",
                    message: "Invalid Token",
                    explanation: "Token mismatch/ expired",
                    statusCode: StatusCodes.UNAUTHORIZED, 
                });
            }
            const user = await this.UserRepository.getById(response.id);
            if(!user) {
                throw {error: "User for this token doesn't exist."};
            }
            return user.dataValues;
        } catch (error) {
            console.log("Something went wrong in user Authentication.");
            throw error;
        }
    }

    async comparePassword(plainPassword, encryptedPassword) {
        try {
            return bcrypt.compareSync(plainPassword, encryptedPassword); 
        } catch (error) {
            console.log("Something went wrong in the password comparision.");
            throw error;
        }
    }

    async signIn({email, password}) {
        try {
            const user = await this.UserRepository.getByEmail(email);
            const passwordMatch = await this.comparePassword(password, user.password);
            if(!passwordMatch) {
                throw new ClientError({
                    name: "Authentication Failed",
                    message: "Invalid password",
                    explanation: "Passwords doesn't match with our existing records.",
                    statusCode: StatusCodes.UNAUTHORIZED, 
                });
            }
            const newJwt = await this.createToken({
                email: user.email,
                id: user.id
            });
            if (!newJwt) {
                throw new AppErrors({
                    name: "JWT Creation Failed",
                    message: "Unable to generate JWT",
                    explanation: "The system failed to generate a valid JWT token for the user",
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR, // 500 status code for server-side issues
                });
            }
            
            return newJwt;
        } catch (error) {
            console.log(error)
            console.log("Something went wrong in the signIn process.");
            throw error;
        }
    }
    

    async isAdmin(userId) {
        try {
            const response = await this.UserRepository.isAdmin(userId);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async generateOTP({ email }) {
        try {
            const user = await this.UserRepository.getByEmail(email);
    
            if (!user) {
                throw { error: 'No user exists with this email' };
            }
    
            const salt = crypto.randomBytes(16).toString('hex'); 
    
            const hash = crypto.createHash('sha256')
                .update(user.dataValues.email + salt) 
                .digest('hex');
            
            let otp = parseInt(hash.slice(0, 6), 16) % 1000000;  
            const otp_token = otp.toString().padStart(6, '0'); 
            //saving token
           // const noti1 = await otpstore.create({user.dataValues.email, otp_token})
           
            sendBasicEmail("jaskaranyt123@gmail.com",
                            email,
                            "response to your forgot password request",
                            otp_token,

                        )
                        const userId = user.dataValues.id
                        otp = otp_token
            const response = await this.UserRepository.storeOtp({userId, otp});
            //update password if update time for otp field - current time is less than 10mins
            return response;
        } catch (error) {
            throw error;
        }                   
    }

    async resetPass({id, otp, password}) {
        try {
            
            //ideally we shouldn't make our calls expensive by check the mail again. frontend ppl should restrict the user coming onto this page from editing their email that has been set during the /forgotPass
            
            const response = await this.UserRepository.resetPass({id, otp, password});
            if(!response) {
                throw "Couldn't update pass"
            }
            return response;
        } catch (error) {
            console.log("Something went wrong in the resetPass process.");
            throw error;
        }
    }
}

module.exports = UserService;