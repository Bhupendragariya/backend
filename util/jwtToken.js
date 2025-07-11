
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import User from "../models/user.model.js";

export const generateAccessAndRefreshTokens = 
  async (userId) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new ErrorHandler("User not found", 404);
      }


      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new ErrorHandler(
        error.message || "Something went wrong while generating tokens",
        500
      );
    }
  };
