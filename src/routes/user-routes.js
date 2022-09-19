const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  getUsers,
  createUser,
  getUser,
  getUserInfo,
  login,
  updateUser,
  deleteUser,
} = require("../controllers/user-controller");

router.get("/", getUsers);

router.post("/", createUser);

router.get("/user-info", auth, getUserInfo);

router.get("/:userId", getUser);

router.post("/login", login);

router.patch("/:userId", updateUser);

router.delete("/:userId", deleteUser);

module.exports = router;
