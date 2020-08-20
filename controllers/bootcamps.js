const path = require("path");
const BootCamp = require("../models/BootCamp");
const ErrorResponse = require("../utlis/errorResponse");
const geoCoder = require("../utlis/geoCoder");
const asyncHandler = require("../middleware/async");

exports.getAllBootCamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootCamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`BootCamp not found with ${req.params.id} this id`, 404)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      bootcamp,
    },
  });
});
exports.createBootCamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const PublishedBootCamp = await BootCamp.findOne({ user: req.user.id });

  if (PublishedBootCamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `the user is with Id ${req.user.id} already publish a bootcamp`
      )
    );
  }
  const newBootcamp = await BootCamp.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      newBootcamp,
    },
  });
});

exports.updateBootCamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await BootCamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`BootCamp not found with ${req.params.id} this id`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await BootCamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      bootcamp,
    },
  });
});

exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootCamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`BootCamp not found with ${req.params.id} this id`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }
  bootcamp.remove();
  res.status(204).send(null);
});

//Get BootCamp Within a Radius
exports.getBootCampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get latitude and longitude
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lan = loc[0].longitude;

  //calculate radius using radians
  //div distance/radius of earth
  //radius of earth 3,963 miles / 6378 km
  const radius = distance / 3963;
  const bootCamps = await BootCamp.find({
    location: { $geoWithin: { $centerSphere: [[lan, lat], radius] } },
  });
  res.status(200).json({
    status: "success",
    count: bootCamps.length,
    data: bootCamps,
  });
});

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootCamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`BootCamp not found with ${req.params.id} this id`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a File`, 400));
  }

  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image File`, 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image File size less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  console.log(file.name);
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse("problrm with file upload", 500));
    }
    await BootCamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      status: "success",
      data: file.name,
    });
  });
});
