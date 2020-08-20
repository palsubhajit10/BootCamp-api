const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utlis/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  // 1) GETTING TOKEN from cookie and checks its there
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new ErrorResponse("You are not logged in , please log in to get access"),
      401
    );
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decode.id);
    next();
  } catch (error) {
    return next(
      new ErrorResponse("You are not authorization to  get access"),
      401
    );
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
