const {StatusCodes} = require('http-status-codes')
class AppErrors extends Error {
    constructor(name = 'AppError', message = 'Something went wrong', explanation = 'Something went wrong', statusCode = StatusCodes.INTERNAL_SERVER_ERROR, success = false) {
        super();
        this.message = message;
        this.explanation = explanation;
        this.statusCode = statusCode;
        this.name = name;
        this.success = success;
    }
}

module.exports = AppErrors;