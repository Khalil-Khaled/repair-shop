const axios = require("axios");
const express = require("express");
const route = express.Router();
var Staffdb = require("../models/staff");

route.get("/", async (req, res) => {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const staff = await Staffdb.findById();

      if (!staff) {
        res.status(404).send({ message: "Not found user with id " + id });
      } else {
        //   res.send(data);
        res.render("staffs/index", { staff });
      }
    } else {
      const staffs = await Staffdb.find();
      console.log(staffs);
      if (staffs) {
        res.render("staffs/index", { staffs });
      }
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error Occurred while retriving user information",
    });
  }
});

route.get("/add", async (req, res) => {
  return res.render("staffs/add-staff");
});

//create and save new user
route.post("/add", async (req, res) => {
  //validate request
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  //new user
  const staff = new Staffdb({
    cin: req.body.cin,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone_number: req.body.phone_number,
    email: req.body.email,
    job: req.body.job,
    gender: req.body.gender,
    status: req.body.status,
  });

  const checkUserCin = await Staffdb.findOne({ cin: req.body.cin });
  if (checkUserCin) {
    return res.status(400).send("U Already Have An Account");
  }

  const checkUserEmail = await Staffdb.findOne({ email: req.body.email });
  if (checkUserEmail) {
    return res.status(400).send("Wrong Email");
  }

  //save user in the database
  staff
    .save(staff)
    .then((data) => {
      res.redirect("/api/staff");
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
  var staff = null;
  staff = await Staffdb.findById(id);
  return res.render("staffs/staff-update", { staff });
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

  if (req.body.job != null && req.body.job != "")
    profileFields.job = req.body.job;

  if (req.body.email != null && req.body.email != "")
    profileFields.email = req.body.email;

  if (req.body.gender != null && req.body.gender != "")
    profileFields.gender = req.body.gender;

  if (req.body.status != null && req.body.status != "")
    profileFields.status = req.body.status;

  let staff = await Staffdb.findById(req.params.id);

  console.log(profileFields);

  await Staffdb.findOneAndUpdate(
    { _id: req.params.id },
    { $set: profileFields }
  )
    .then((data) => {
      console.log("last update", data);

      res.redirect("/api/staff");
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
});

route.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  await Staffdb.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.redirect("/api/staff/");
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
});

module.exports = route;
