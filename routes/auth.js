const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgetPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(protect, getMe);

router.route("/forgetpassword").post(forgetPassword);
router.put("/resetpassword/:resettoken", resetPassword);

router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

module.exports = router;
