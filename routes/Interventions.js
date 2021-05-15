const express = require("express");
const intervention = require("../models/interventions");
const { db } = require("../models/interventions");
const router = express.Router();
const Intervention = require("../models/interventions");
const User = require("../models/user");
const Staff = require("../models/staff");
const { ItemDB } = require("../models/item");

// All interventions route
router.get("/", async (req, res) => {
  let query = Intervention.find()
    .populate("client")
    .populate("staffs")
    .populate("items");
  let searchOptions = {};
  if (req.query.client != null && req.query.client !== "") {
    searchOptions.client = new RegExp(req.query.client, "i");
    query = query.where("client", searchOptions.client);
  }
  if (req.query.staff != null && req.query.staff != "") {
    searchOptions.staff = new RegExp(req.query.staff, "i");
    query = query.where("staff", searchOptions.staff);
  }
  try {
    const interventions = await query.exec();
    res.render("interventions/index", {
      interventions: interventions,
      searchOptions: req.query,
    });
  } catch (r) {
    console.log(r);
  }
});

// new intervention route
router.get("/new", async (req, res) => {
  const staffs = await Staff.find();
  const users = await User.find();
  const items = await ItemDB.find();
  res.render("interventions/newIntervention", {
    intervention: new Intervention(),
    staffs,
    users,
    items,
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
  });
  console.log(req.body.staffs);
  console.log(req.body.items);
  try {
    const newIntervention = await intervention.save();
    res.redirect("interventions");
  } catch (err) {
    console.log(err);
    res.render("interventions/new", {
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
    const intervention = await Intervention.findById(req.params.id);
    console.log(intervention);
    res.render("interventions/updateIntervention", {
      intervention: intervention,
      staffs,
      users,
      items,
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
  let intervention = await Intervention.findById(req.params.id);
  intervention.status = "Done";
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

  await intervention
    .save()
    .then(() => {
      res.redirect(`/interventions/showIntervention/${intervention.id}`);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
});

// show intervention route
router.get("/showIntervention/:id", async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id)
      .populate("client")
      .populate("staffs")
      .populate("items");
    Date.prototype.formatMMDDYYYY = function () {
      return (
        this.getMonth() + 1 + "/" + this.getDate() + "/" + this.getFullYear()
      );
    };
    console.log(intervention);
    res.render("interventions/showIntervention", {
      intervention: intervention,
      errorMessage: "",
    });
  } catch {
    res.redirect("/interventions");
  }
});

module.exports = router;
