const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
dotenv.config({ path: "../config.env" });
const BootCamp = require("../models/BootCamp");
const Courses = require("../models/Course");
const User = require("../models/User");
const Review = require("../models/Reviews");

mongoose
  .connect(process.env.DATABASE, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections)
    console.log("database connected....");
  })
  .catch((err) => {
    console.log(err);
  });

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/courses.json`, "utf-8")
);
const bootcamp = JSON.parse(
  fs.readFileSync(`${__dirname}/bootcamps.json`, "utf-8")
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

const importData = async () => {
  try {
    await BootCamp.create(bootcamp);
    await Courses.create(courses);
    // await User.create(users);
    // await Review.create(reviews);

    console.log("data inserted succesfully");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Courses.deleteMany();
    await BootCamp.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("data deleted succesfully");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "-import") {
  importData();
} else if (process.argv[2] === "-delete") {
  deleteData();
}
