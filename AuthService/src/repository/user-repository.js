const { StatusCodes } = require('http-status-codes');
const {User, Role, otpStore} = require('../models/index');
const ClientError = require('../utils/client-error');
const ValidationError = require('../utils/validation-error');
const { Op } = require('sequelize');
const { message } = require('telegraf/filters');
const bcrypt = require('bcrypt');
const { SALT } = require('../config/serverConfig');

class UserRepository {
    async create(data) {
        try {
            
            const user = await User.create(data);
            //role.addUser(user)
            //after user Creation, bydefault make them a user (Not an admin)
            const role = await Role.findOne({
                where:{
                    name : "Customer"
                }
            })
            await role.addUser(user) 
            return user;
        } catch (error) {
            if(error.name == "SequelizeValidationError") {
                throw new ValidationError(error);
            }
            
            if(error.name == "SequelizeUniqueConstraintError") {
                throw new ValidationError(error);
            }
            console.log("Something went wrong at repository layer.")
            throw error;
        }
    }

    async storeOtp(data) {
        try {
            const {userId, otp} = data
            console.log(userId)
            console.log(otp)
            
            const noti = await otpStore.upsert(data);
            return noti;
        } catch (error) {
            
            console.log("Something went wrong at repository layer.")
            throw error;
        }
    }
    async destroy(userId) {
        try {
            await User.destroy({
                where: {
                    id: userId
                }
            })
            return true;
        } catch (error) {
           
            console.log("Something went wrong at repository layer.");
            throw error;
        }
    }
    async getById(userId) {
        try {
            const user = await User.findByPk(userId,{
                attributes:['email', 'id']
            })
            
            return user;
        } catch (error) {
            console.log("Something went wrong at repository layer.");
            throw error;
        }
    }

    async getByEmail(email) {
        try {
            const user = await User.findOne({
                where:{
                    email,
                }
            })
            if(!user) {
                throw new ClientError({name:"Attribute Not_FOUND",message: "User not found" ,explanation: "user with given email doesn't exist",StatusCode:StatusCodes.NOT_FOUND})
            }
            return user;
        } catch (error) {
            console.log("Something went wrong at repository layer.");
            throw error;
        }
    }

    async isAdmin(userId) {
        try {
            const user = await User.findByPk(userId)
            if (!user) {
                throw new ClientError({
                    name: "User Not Found",
                    message: "Invalid user ID",
                    explanation: "The provided user ID does not exist in the system",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }
            const adminRole = await Role.findOne({
                where: {
                    name: 'Admin'
                }
            })
            const status = await user.hasRole(adminRole);
            if(!status) {
                throw new ClientError({
                    name: "Not an Admin",
                    message: "user is not an admin",
                    explanation: "User does not have the required admin privileges",
                    statusCode: StatusCodes.UNAUTHORIZED,
                });
            }
            return true
        } catch (error) {
            console.log("Something went wrong at repository layer.");
            throw error;
        }
    }

    async resetPass({id, otp, password}) {
        try {
            const passwordChangeRequest = await otpStore.findOne({
                where:{
                    userId:id,
                }
            })
            if(!passwordChangeRequest) { 
                throw new ClientError({
                    name: "ACCESS RESTRICTED",
                    message: "Hit the /forgotPass endpoint to get OTP on your registered mail first",
                    explanation: "You need to request a new OTP because no OTP was previously generated",
                    statusCode: StatusCodes.UNAUTHORIZED,
                  });
                  
            }
            //check if update time for current time - update timestamp for otp is less tahn equal to 10mins

            const otpRecord = await otpStore.findOne({
                where: {
                  userId: id,
                  updatedAt: {
                    [Op.gte]: new Date(Date.now() - 10 * 60 * 1000),
                  },
                },
              });
              if(!otpRecord) {
                throw new ClientError({name:"ACCESS RESTRICTED",message: "Expired token" ,explanation: "OTP submitted is expired",statusCode:StatusCodes.UNAUTHORIZED})
            
              }

            if(otp != passwordChangeRequest.otp) {
                throw new ClientError({name:"ACCESS RESTRICTED",message: "Incorrect/ Tampered token" ,explanation: "OTP submitted is incorrect",statusCode:StatusCodes.UNAUTHORIZED})
            
            }
            const user = await User.findOne({
                where: {
                    id,
                }
            })
            const encryptedPassword = bcrypt.hashSync(password, SALT)
            user.password = encryptedPassword
            await user.save()

            // remove otp from otpStores
            await otpStore.destroy({
                where:{
                    userId: id
                }
            })
            return user
        } catch (error) {
            console.log("Something went wrong at repository layer.");
            throw error;
        }
    }

}

module.exports = UserRepository;
