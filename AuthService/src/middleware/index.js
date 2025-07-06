const { validateUserAuth, validateIsAdminRequest ,validateLogin, validateForgotPassRequest, validateResetPassRequest} = require('./auth-req-validators')

module.exports = {
    validateUserAuth,
    validateIsAdminRequest,
    validateLogin, 
    validateForgotPassRequest, 
    validateResetPassRequest
}