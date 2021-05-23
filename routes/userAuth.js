const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();
const User = require("../models/userAuth");
const bcrypt = require("bcryptjs");
const generateToken = require("../utilities/generateToken");
const { compare } = require("../utilities/cryptPassword");

router.get("/login", (req, res) => {
  res.render("authentification/login");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

router.get("/register", (req, res) => {
  res.render("authentification/register");
});

router.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const plainTextPassword = req.body.password;

  if (!username) {
    return res.status(400).render("authentification/register", {
      usernameError: "Invalid user name",
      messageClass: "alert-danger",
    });
  }

  if (!email) {
    return res.status(400).render("authentification/register", {
      emailError: "Invalid Email",
      messageClass: "alert-danger",
    });
  }

  if (!plainTextPassword) {
    return res.status(400).render("authentification/register", {
      passwordReError: "Invalid password",
      messageClass: "alert-danger",
    });
  }

  password = await bcrypt.hash(plainTextPassword, 10);
  try {
    const response = await User.create({
      username,
      email,
      password,
    });
    return res.redirect("/auth/login");
  } catch (err) {
    if (err.code == 11000) {
      return res.json({ status: "error", error: "Username already exists" });
    }
  }

  res.json({ status: "success", msg: "You are registred Successfully" });
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password, "from form");

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render("authentification/login", {
        userError: "The email you’ve entered doesn’t match any account",
        messageClass: "alert-danger",
      });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render("authentification/login", {
        passwordError: "The password you’ve entered is incorrect",
        messageClass: "alert-danger",
      });
    }
    if (isMatch) {
      const expire = "7d";
      const token = await generateToken(user.id, expire);
      res.cookie("token", token, { secure: true });

      return res.status(200).redirect("/shop");
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
