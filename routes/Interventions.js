const express = require("express");
const intervention = require("../models/interventions");
const { db } = require("../models/interventions");
const router = express.Router();
const Intervention = require("../models/interventions");
const User = require("../models/user");
const Staff = require("../models/staff");
const { ItemDB } = require("../models/item");
const Car = require("../models/car");

// All interventions route
router.get("/", async (req, res) => {
  let query = Intervention.find()
    .populate("client")
    .populate("car")
    .populate("staffs")
    .populate("items");
  let clientQuery = User.find();
  let carQuery = Car.find();
  let searchOptions = {};
  if (req.query.client != null && req.query.client !== "") {
    searchOptions.client = new RegExp(req.query.client, "i");
    clientQuery = clientQuery.where("first_name", searchOptions.client);
    const client = await clientQuery.exec();
    query = query.where("client", client);
  }
  if (req.query.car != null && req.query.car != "") {
    searchOptions.car = new RegExp(req.query.car, "i");
    carQuery = carQuery.where("brand", searchOptions.car);
    const car = await carQuery.exec();
    query = query.where("car", car);
  }
  try {
    const interventions = await query.sort({ status: -1 }).exec();
    res.render("interventions/index", {
      interventions: interventions,
      searchOptions: req.query,
    });
  } catch (r) {
    console.log(r);
  }
});

// All interventions route for client
router.get("/client", async (req, res) => {
  let query = Intervention.find()
    .populate("client")
    .populate("car")
    .populate("staffs")
    .populate("items");
  let clientQuery = User.find();
  let carQuery = Car.find();
  let searchOptions = {};
  if (req.query.client != null && req.query.client !== "") {
    searchOptions.client = new RegExp(req.query.client, "i");
    clientQuery = clientQuery.where("first_name", searchOptions.client);
    const client = await clientQuery.exec();
    query = query.where("client", client);
  }
  if (req.query.car != null && req.query.car != "") {
    searchOptions.car = new RegExp(req.query.car, "i");
    carQuery = carQuery.where("brand", searchOptions.car);
    const car = await carQuery.exec();
    query = query.where("car", car);
  }
  try {
    const interventions = await query.sort({ status: -1 }).exec();
    res.render("interventions/indexClient", {
      interventions: interventions,
      searchOptions: req.query,
    });
  } catch (r) {
    console.log(r);
  }
});

// new intervention route
router.get("/new", async (req, res) => {
  const staffs = await Staff.find().where("status", "Inactive");
  const users = await User.find();
  const items = await ItemDB.find();
  const cars = await Car.find();
  res.render("interventions/newIntervention", {
    intervention: new Intervention(),
    staffs,
    users,
    items,
    cars,
    errorMessage: "",
  });
});

// create intervention route
router.post("/", async (req, res) => {
  const intervention = new Intervention({
    startDate: new Date(req.body.startDate),
    estimatedTime: new Date(req.body.estimatedTime),
    price: req.body.price,
    description: req.body.description,
    notes: req.body.notes,
    type: req.body.type,
    discount: req.body.discount,
    status: "In Process",
    client: req.body.client,
    staffs: req.body.staffs,
    items: req.body.items,
    car: req.body.car,
  });
  try {
    if (intervention.staffs.length > 0) {
      for (var i = 0; i < intervention.staffs.length; i++) {
        intervention.staffs[i].status = "Active";
        let staff = await Staff.findById(intervention.staffs[i]);
        await staff.updateOne(intervention.staffs[i]);
      }
    }
    const newIntervention = await intervention.save();
    res.redirect("interventions");
  } catch (err) {
    console.log(err);
    res.render("interventions/newIntervention", {
      intervention: intervention,
      errorMessage: "Error Creating the intervention",
    });
  }
});

// update intervention route
router.get("/:id", async (req, res) => {
  try {
    const staffs = await Staff.find();
    const users = await User.find();
    const items = await ItemDB.find();
    const cars = await Car.find();
    const intervention = await Intervention.findById(req.params.id)
      .populate("client")
      .populate("car")
      .populate("staffs")
      .populate("items");
    res.render("interventions/updateIntervention", {
      intervention: intervention,
      staffs,
      interventionStaffs: intervention.staffs.map((staff) => staff._id),
      users,
      items,
      interventionItems: intervention.items.map((item) => item.id),
      cars,
      errorMessage: "",
    });
  } catch {
    res.redirect("/interventions");
  }
});

// update intervention route in edit view
router.get("/edit/:id", async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    res.render("interventions/index", {
      intervention: intervention,
      errorMessage: "",
    });
  } catch {
    res.redirect("/interventions");
  }
});

// update an intervention status when done with specified intervention id in the request
router.put("/done/:id", async (req, res, next) => {
  let intervention = await Intervention.findById(req.params.id).populate("car");
  intervention.status = "Done";
  intervention.car.carStatus = "fixed";
  if (intervention.staffs.length > 0) {
    for (var i = 0; i < intervention.staffs.length; i++) {
      intervention.staffs[i].status = "Inactive";
      let staff = await Staff.findById(intervention.staffs[i]);
      await staff.updateOne(intervention.staffs[i]);
    }
  }
  await intervention.car.updateOne(intervention.car).catch((error) => {
    res.status(400).json({
      error: error,
    });
  });

  await intervention
    .updateOne(intervention)
    .then(() => {
      res.redirect("/interventions");
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
});

// update an intervention with specified intervention id in the request
router.put("/edit/:id", async (req, res, next) => {
  let intervention = await Intervention.findById(req.params.id)
    .populate("client")
    .populate("staffs")
    .populate("items");
  try {
    if (req.body.estimatedTime != null && req.body.estimatedTime != "")
      intervention.estimatedTime = new Date(req.body.estimatedTime);

    if (req.body.price != null && req.body.price != "")
      intervention.price = req.body.price;

    if (req.body.description != null && req.body.description != "")
      intervention.description = req.body.description;

    if (req.body.notes != null && req.body.notes != "")
      intervention.notes = req.body.notes;

    if (req.body.type != null && req.body.type != "")
      intervention.type = req.body.type;

    if (req.body.discount != null && req.body.discount != "")
      intervention.discount = req.body.discount;

    if (req.body.staff != null && req.body.staff != "")
      intervention.staff = req.body.staff;

    if (req.body.item != null && req.body.item != "")
      intervention.item = req.body.item;

    if (req.body.car != null && req.body.car != "")
      intervention.car = req.body.car;

    if (req.body.items.length > 0) intervention.items = req.body.items;

    if (req.body.staffs.length > 0) intervention.staffs = req.body.staffs;

    for (var i = 0; i < intervention.staffs.length; i++) {
      intervention.staffs[i].status = "Active";
      let staff = await Staff.findById(intervention.staffs[i]);
      await staff.updateOne(intervention.staffs[i]);
    }

    await intervention.save().then(() => {
      res.redirect(`/interventions/showIntervention/${intervention.id}`);
    });
  } catch (err) {
    console.log(err);
    if (intervention == null) {
      res.redirect("/");
    } else {
      res.render("interventions/updateIntervention", {
        intervention: intervention,
        errorMessage: "Error Updating the intervention",
      });
    }
  }
});

// show intervention route
router.get("/showIntervention/:id", async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id)
      .populate("client")
      .populate("car")
      .populate("staffs")
      .populate("items");
    if (intervention.items.length > 0) {
      var itemsPrice = parseInt(intervention.price, 10);
      for (var i = 0; i < intervention.items.length; i++) {
        itemsPrice = intervention.items[i].price + itemsPrice;
        intervention.price = itemsPrice.toString();
      }
    }
    if (intervention.discount != null && intervention.discount != "") {
      var discountPrice = parseInt(intervention.price, 10);
      var discountDiscount = parseInt(intervention.discount, 10);
      var discountPrice =
        discountPrice - (discountPrice * discountDiscount) / 100;
      intervention.price = discountPrice.toString();
    }
    Date.prototype.formatMMDDYYYY = function () {
      return (
        this.getMonth() + 1 + "/" + this.getDate() + "/" + this.getFullYear()
      );
    };
    res.render("interventions/showIntervention", {
      intervention: intervention,
      errorMessage: "",
    });
  } catch {
    res.redirect("/interventions");
  }
});

module.exports = router;
