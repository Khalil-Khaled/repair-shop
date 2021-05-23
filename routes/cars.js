const express = require("express");
const car = require("../models/car");
const { db } = require("../models/car");
const router = express.Router();
const Car = require("../models/car");

// Get all cars by admin
router.get("/", async (req, res) => {
  let query = Car.find();
  let searchOptions = {};
  if (req.query.brand != null && req.query.brand !== "") {
    query = query.where("brand", req.query.brand);
  }
  if (req.query.model != null && req.query.model != "") {
    query = query.lte("model", req.query.model);
  }
  if (req.query.platesNumber != null && req.query.platesNumber != "") {
    query = query.lte("platesNumber", req.query.platesNumber);
  }
  if (req.query.carStatus != null && req.query.carStatus != "") {
    query = query.lte("carStatus", req.query.carStatus);
  }
  try {
    const cars = await query.exec();
    res.render("cars/index", { cars: cars, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

router.get("/new", (req, res) => {
  res.render("cars/newCar", {
    car: new Car(),
    errorMessage: "",
  });
});

// create car route
router.post("/", async (req, res) => {
  const car = new Car({
    brand: req.body.brand,
    model: req.body.model,
    platesNumber: req.body.platesNumber,
    year: req.body.year,
    color: req.body.color,
    carStatus: req.body.carStatus,
  });
  try {
    const newCar = await car.save();
    //res.redirect(`offers/${newOffer.id}`);
    res.redirect("cars");
  } catch (err) {
    console.log(err);
    res.render("cars/index", {
      car: car,
      errorMessage: "Error Creating the car",
    });
  }
});

// update car route
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    console.log(car);
    res.render("cars/updateCar", {
      car: car,
      errorMessage: "",
    });
  } catch {
    res.redirect("/cars");
  }
});

// update car route in edit view
router.get("/edit/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    res.render("cars/index", {
      car: car,
      errorMessage: "",
    });
  } catch {
    res.redirect("/cars");
  }
});

// update car
router.put("/edit/:id", async (req, res, next) => {
  let car = await Car.findById(req.params.id);
  if (req.body.brand != null && req.body.brand != "")
    car.brand = req.body.brand;
  if (req.body.model != null && req.body.model != "")
    car.model = req.body.model;
  if (req.body.platesNumber != null && req.body.platesNumber != "")
    car.platesNumber = req.body.platesNumber;

  if (req.body.year != null && req.body.year != "") car.year = req.body.year;
  if (req.body.color != null && req.body.color != "")
    car.color = req.body.color;
  if (req.body.carStatus != null && req.body.carStatus != "")
    car.carStatus = req.body.carStatus;

  await car
    .save()
    .then(() => {
      res.redirect("/cars");
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
});

//delete
router.post("/delete/:id", async (req, res) => {
  let car = await Car.findById(req.params.id);

  car
    .delete()
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "something went wrong" });
      } else {
        res.redirect("/cars");
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete car with id=" + id,
      });
    });
});

module.exports = router;
