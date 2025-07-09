import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import ErrorHandler from "../middlewares/errorMiddlewares";
import User from "../models/user.model";
import { generateAccessAndRefreshTokens } from "../util/jwtToken";





// export const refreshAccessToken = catchAsyncErrors(async (req, res, next) => {

//   const incomingRefreshToken =
//     req.cookies.refreshToken || req.body.refreshToken;

//   if (!incomingRefreshToken) {
//     return next(new ErrorHandler(401, "unauthorized request"));
//   }

//   try {
//     const decoded = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );
//     const user = await User.findById(decoded.id).select("+refreshToken");

//     if (!user) {
//       return next(new ErrorHandler(401, "invalid refresh  token"));
//     }

  
//     if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
//       return next(new ErrorHandler("Invalid refresh token", 401));
//     }

//     const { accessToken, refreshToken:newRefreshToken } = await generateAccessAndRefreshTokens(
//         user._id
//     );
//     user.refreshToken = newRefreshToken;
//     await user.save();

//     const cookieName = user.role === "Admin" ? "adminToken" : "employeeToken";

//     res.cookie(cookieName, newRefreshToken, {
//       httpOnly: true,
//       sameSite: "Strict",
//     });

//     res.status(200).json({
//       message: "Access token refreshed successfully",
//       accessToken,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(401, "invalid refresh token"));
//   }
// });





