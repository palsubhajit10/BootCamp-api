const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const eocode = require("../utlis/geoCoder");
const geocoder = require("../utlis/geoCoder");

const BootCampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Add A Name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name Can Not Be More Than 50 Charecter"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please Add A Description"],
      maxlength: [500, "Name Can Not Be More Than 50 Charecter"],
    },
    website: {
      type: String,
      validate: [validator.isURL, "Please Use A Valid URL With HTTP Or HTTPS"],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number cannot be more than 20 charecters"],
      //validate: [validator.isMobilePhone, "Please Provide A Valid Phone Number"],
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please Provide A Valid Email"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must can not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//Create bootcamp from slug
BootCampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: false });
  next();
});
//Geocode and create location field
BootCampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  //Do NOt save Address in db
  this.address = undefined;
  next();
});
//CASCADE delete courses when a bootcamp is deleted
BootCampSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({ bootcamp: this._id });
  next();
});

//Reverse populate with virtual
BootCampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});
const BootCamp = mongoose.model("BootCamp", BootCampSchema);

module.exports = BootCamp;
