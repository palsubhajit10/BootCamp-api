const express = require("express");
const router = express.Router();

const {
  getAllBootCamps,
  getBootCamp,
  createBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootCampInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const bootCampModel = require("../models/BootCamp");
const advancedResults = require("../middleware/advanceResults");
const { protect, authorize } = require("../middleware/auth");

const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router.route("/radius/:zipcode/:distance").get(getBootCampInRadius);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router
  .route("/")
  .get(advancedResults(bootCampModel, "courses"), getAllBootCamps)
  .post(protect, authorize("publisher", "admin"), createBootCamp);

router
  .route("/:id")
  .get(getBootCamp)
  .put(protect, authorize("publisher", "admin"), updateBootCamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootCamp);

module.exports = router;
