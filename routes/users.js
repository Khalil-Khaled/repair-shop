const axios = require("axios");
const express = require("express");
const route = express.Router();
var Userdb = require("../models/user");

/* route.get("/", (req, res) => {
  //Make a get request to /api/users
  axios
    .get("http://localhost:3000/api/users")

    .then(function (response) {
      console.log(response);
      res.render("users_view", {
        users: response.data,
      });
    })
    .catch((err) => {
      res.send(err);
    });
}); */

// retrieve and return all users/ retrive and return a single user
route.get("/", async (req, res) => {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const user = await Userdb.findById();

      if (!user) {
        res.status(404).send({ message: "Not found user with id " + id });
      } else {
        //   res.send(data);
        res.render("users/index", { user });
      }
    } else {
      const users = await Userdb.find();
      if (users) {
        res.render("users/index", { users });
      }
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occurred while retriving user information",
    });
  }
});

route.get("/add", async (req, res) => {
  return res.render("users/add-user");
});

//create and save new user
route.post("/add", async (req, res) => {
  //validate request
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  //new user
  const user = new Userdb({
    cin: req.body.cin,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone_number: req.body.phone_number,
    email: req.body.email,
    gender: req.body.gender,
    status: req.body.status,
  });

  const checkUserCin = await Userdb.findOne({ cin: req.body.cin });
  if (checkUserCin) {
    return res.status(400).send("U Already Have An Account");
  }

  const checkUserEmail = await Userdb.findOne({ email: req.body.email });
  if (checkUserEmail) {
    return res.status(400).send("Wrong Email");
  }

  //save user in the database
  user
    .save(user)
    .then((data) => {
      res.redirect("/api/users");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating a create operation",
      });
    });
});

route.get("/:id", async (req, res) => {
  const id = req.params.id;
  var user = null;
  user = await Userdb.findById(id);
  return res.render("users/user-update", { user });
});

// Update a new idetified user by user id
route.post("/:id", async (req, res, next) => {
  const profileFields = {};

  if (req.body.cin != null && req.body.cin != "")
    profileFields.cin = req.body.cin;

  if (req.body.first_name != null && req.body.first_name != "")
    profileFields.first_name = req.body.first_name;

  if (req.body.last_name != null && req.body.last_name != "")
    profileFields.last_name = req.body.last_name;

  if (req.body.phone_number != null && req.body.phone_number != "")
    profileFields.phone_number = req.body.phone_number;

  if (req.body.email != null && req.body.email != "")
    profileFields.email = req.body.email;

  if (req.body.gender != null && req.body.gender != "")
    profileFields.gender = req.body.gender;

  if (req.body.status != null && req.body.status != "")
    profileFields.status = req.body.status;

  let user = await Userdb.findById(req.params.id);

  // user exist or not
  // check if email is already in use
  // check if cin is already in use

  await Userdb.findOneAndUpdate({ _id: req.params.id }, { $set: profileFields })
    .then((data) => {
      console.log("last update", data);

      res.redirect("/api/users");
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
});

route.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  Userdb.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.redirect("/api/users/");
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
});

module.exports = route;
