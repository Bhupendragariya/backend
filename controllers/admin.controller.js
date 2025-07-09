import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import ErrorHandler from "../middlewares/errorMiddlewares";
import User from "../models/user.model";
import { generateAccessAndRefreshTokens } from "../util/jwtToken";


export const createEmployee = catchAsyncErrors( async( req, res, next) =>{

    
});
