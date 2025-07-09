import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";



export const refreshAccessToken = catchAsyncErrors(async (req, res, next) => {

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new ErrorHandler(401, "unauthorized request"));
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user  ) {
      return next(new ErrorHandler(401, "invalid refresh  token"));
    }

  
    if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
      return next(new ErrorHandler("Invalid refresh token", 401));
    }

    const { accessToken, refreshToken:newRefreshToken } =  generateAccessAndRefreshTokens(
        user._id
    );
    user.refreshToken = newRefreshToken;
    await user.save();

    const cookieName =
    user.role === "Admin" ? "adminToken"
    : user.role === "HR" ? "hrToken"
    : "employeeToken";

    res.cookie(cookieName, newRefreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return next(new ErrorHandler(401, "invalid refresh token"));
  }
});







export const getEmployeeDashboard = catchAsyncErrors( async( req, res, next) =>{
    try {
        const employeeId = req.params.id;

        const employee = await User.findById(employeeId);

        if (!employee) {
            return next( new ErrorHandler("employ not found  ", 400))
        }


        
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
})





