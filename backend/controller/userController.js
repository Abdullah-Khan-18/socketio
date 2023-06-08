const asyncHandler = require("express-async-handler");
const User = require(".././models/userModel");
const generateToken = require("../config/generateToken");

//! ----------     registerUSer     -----------     //
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the Feilds");
    }

    const userExits = await User.findOne({ email });
    if (userExits) {
      res.status(400);
      throw new Error("User is already exits");
    }

    const user = await User.create({
      name,
      email,
      password,
      pic,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Failed to create the user.");
    }
  } catch (error) {
    console.log("Error from registerUser in userController.js", error);
  }
});

//! ----------     authUser     -----------     //
const authUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // const checkPassword = await user.matchPassword(password);
    if (user && await user.matchPassword(password)) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invlaid Email or Password");
    }
  } catch (error) {
    console.log(" Error from authUser in userController.js", error);
  }
});

//! ----------     allUsers     -----------     //
const allUsers = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({
      _id: { $ne: req.user._id },
    });

    res.send(users);
  } catch (error) {
    console.log("errror from allUsers in userController.js :>> ", error);
  }
});

module.exports = { registerUser, authUser, allUsers };
