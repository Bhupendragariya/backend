class ErrorHandler extends Error{
   constructor(message, statusCode) {
    super(message); 

    this.statusCode = statusCode || 500;  
    this.message = message || "Internal Server Error"; 
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}


export const errorMiddleware = (err, req, res, next) =>{
    
  
    err.message = err.message || "internal server error";
    err.statusCode = err.statusCode || 500;

    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered` ;
           err = new ErrorHandler(message, 400);
    }

    if(err.name === "jsonWebTokenError"){
        const message = "Json web token is invalid, please try again";
        err = new ErrorHandler(message, 400);
    }

    if( err.name === "TokenExpiredError"){
        const message = "json web token is expired, please try again";
        err = new ErrorHandler(message, 400);

    }

    if (err.name === "CastError"){
        const message = `Resource not found, invalid:${err.path}`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "ValidationError"){
      const message = Object.values(err.errors).map(val => val.message).join(", ");
      err = new ErrorHandler(message, 400);

    }

    const errorMessage = err.errors ? Object.values(err.errors).map((error) => error.message).join(" ") : err.message;


    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    })

};

export default ErrorHandler;