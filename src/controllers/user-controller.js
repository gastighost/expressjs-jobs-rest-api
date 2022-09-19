require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const createError = require("../utils/custom-error");
const asyncWrapper = require("../utils/async");
const User = require("../models/user");

exports.getUsers = asyncWrapper(async (req, res) => {
  const users = await User.find({});
  res
    .status(200)
    .json({ message: "Users successfully retrieved!", users: users });
});

exports.createUser = asyncWrapper(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(
      createError("Please provide a username, email and password.", 400)
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  const token = jwt.sign(
    {
      data: {
        userId: newUser._id,
        userEmail: newUser.email,
        username: newUser.username,
      },
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.status(201).json({
    message: "User successfully created!",
    user: newUser,
    token: token,
  });
});

exports.getUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  res.status(200).json({ message: "User successfully retrieved!", user: user });
});

exports.getUserInfo = asyncWrapper(async (req, res) => {
  res
    .status(200)
    .json({ message: "User info successfully retrieved!", user: req.user });
});

exports.login = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(createError("Please provide username and password", 400));
  }

  const user = await User.findOne({ username });

  if (!user) {
    return next(createError("Username or password does not match", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(createError("Username or password does not match", 401));
  }

  const token = jwt.sign(
    {
      data: {
        userId: user._id,
        userEmail: user.email,
        username: user.username,
      },
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res
    .status(200)
    .json({ message: "User successfully logged in!", token: token });
});

exports.updateUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const { username, email, password } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { username, email, password },
    { new: true }
  );

  res.status(200).json({ message: "User successfully updated!", user: user });
});

exports.deleteUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  res.status(200).json({ message: "User successfully deleted!", user: user });
});
