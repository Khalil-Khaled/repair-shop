const express = require("express");
const router = express.Router();
const Offer = require("../models/offer");
const imageMimeTypes = ["image/jpeg", "image/png"];
const mongoose = require("mongoose");
const { ItemDB } = require("../models/item");
var LocalStorage = require("node-localstorage").LocalStorage;

// All offers Postman Route
router.get("/json", async (req, res) => {
  let query = Offer.find();
  query.select("-offerImage");
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
    query = query.where("name", searchOptions.name);
  }
  if (req.query.issuedBefore != null && req.query.issuedBefore != "") {
    query = query.lte("issueDate", req.query.issuedBefore);
  }
  if (req.query.issuedAfter != null && req.query.issuedAfter != "") {
    query = query.gte("issueDate", req.query.issuedAfter);
  }
  try {
    const offers = await query.exec();
    res.json(offers);
  } catch {
    res.redirect("/");
  }
});

// All offers route
router.get("/", async (req, res) => {
  console.log("offer route");
  console.log(localStorage.getItem("myFirstKey"));
  let query = Offer.find().populate("offerItems").populate("offerFreeItems");
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
    query = query.where("name", searchOptions.name);
  }
  if (req.query.issuedBefore != null && req.query.issuedBefore != "") {
    query = query.lte("issueDate", req.query.issuedBefore);
  }
  if (req.query.issuedAfter != null && req.query.issuedAfter != "") {
    query = query.gte("issueDate", req.query.issuedAfter);
  }
  try {
    const offers = await query.exec();
    res.render("offers/index", { offers: offers, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

// new offer route
router.get("/new", async (req, res) => {
  try {
    const items = await ItemDB.find();
    // console.log(items);
    res.render("offers/new", {
      offer: new Offer(),
      errorMessage: "",
      items: items,
      offerFreeItems: "",
      offerItems: "",
    });
  } catch {
    console.log("error while retrieving items");
  }
});

// create offer route Json
router.post("/json", async (req, res) => {
  console.log(req.body.name);
  const offer = new Offer(req.body);
  try {
    const newOffer = await offer.save();
  } catch (err) {
    console.log(err);
  }
  res.json(offer);
});

// create offer route
router.post("/", async (req, res) => {
  const offer = new Offer({
    name: req.body.name,
    price: req.body.price,
    discount: req.body.discount,
    issueDate: new Date(req.body.issueDate),
    expirationDate: new Date(req.body.expirationDate),
    offerItems: req.body.items,
    offerFreeItems: req.body.freeItems,
  });
  //console.log(items);
  saveImage(offer, req.body.image);
  // console.log(offer);
  try {
    const newOffer = await offer.save();
    res.redirect(`offers/${newOffer.id}`);
  } catch (err) {
    console.log(err);
    res.render("offers/new", {
      offer: offer,
      errorMessage: "Error Creating the offer",
    });
  }
});

// get offer by id
router.get("/:id/json", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).select("-offerImage");
    res.json(offer);
  } catch {
    res.redirect("/");
  }
});

// get offer by id
router.get("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    res.render("offers/show", { offer: offer });
  } catch {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const items = await ItemDB.find();
    const offer = await Offer.findById(req.params.id)
      .populate("offerItems")
      .populate("offerFreeItems");
    res.render("offers/edit", {
      offer: offer,
      errorMessage: "",
      offerItems: offer.offerItems.map((item) => item.id),
      offerFreeItems: offer.offerFreeItems.map((item) => item.id),
      items: items,
    });
  } catch {
    res.redirect("/offers");
  }
});

// Put Request JSON
router.put("/:id/json", async (req, res) => {
  let offer;
  console.log(req.body.image);
  try {
    offer = await Offer.findById(req.params.id).select("-offerImage");
    if (req.body.name != null && req.body.name != "")
      offer.name = req.body.name;
    if (req.body.price != null && req.body.price != "")
      offer.price = req.body.price;
    if (req.body.discount != null && req.body.discount != "")
      offer.discount = req.body.discount;
    if (req.body.issueDate != null && req.body.issueDate != "")
      offer.issueDate = new Date(req.body.issueDate);
    if (req.body.expirationDate != null && req.body.expirationDate != "")
      offer.expirationDate = new Date(req.body.expirationDate);
    if (req.body.image != null && req.body.image != "")
      saveImage(offer, req.body.image);
    if (req.body.items.length > 0) offer.offerItems = req.body.items;
    if (req.body.freeItems.length > 0)
      offer.offerFreeItems = req.body.freeItems;
    await offer.save();
  } catch (err) {
    console.log(err);
  }
  if (offer == null) {
    res.json("Offer not found");
  } else {
    res.json(offer);
  }
});

router.put("/:id", async (req, res) => {
  let offer;
  console.log(req.body.image);
  try {
    offer = await Offer.findById(req.params.id);
    if (req.body.name != null && req.body.name != "")
      offer.name = req.body.name;
    if (req.body.price != null && req.body.price != "")
      offer.price = req.body.price;
    if (req.body.discount != null && req.body.discount != "")
      offer.discount = req.body.discount;
    if (req.body.issueDate != null && req.body.issueDate != "")
      offer.issueDate = new Date(req.body.issueDate);
    if (req.body.expirationDate != null && req.body.expirationDate != "")
      offer.expirationDate = new Date(req.body.expirationDate);
    if (req.body.image != null && req.body.image != "")
      saveImage(offer, req.body.image);
    if (req.body.items.length > 0) offer.offerItems = req.body.items;
    if (req.body.freeItems.length > 0)
      offer.offerFreeItems = req.body.freeItems;
    await offer.save();
    res.redirect(`/offers/${offer.id}`);
  } catch (err) {
    console.log(err);
    if (offer == null) {
      res.redirect("/");
    } else {
      res.render("offers/edit", {
        offer: offer,
        errorMessage: "Error Updating the offer",
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  let offer;
  console.log(req.body.image);
  try {
    offer = await Offer.findById(req.params.id);
    await offer.remove();
    res.redirect(`/offers`);
  } catch (err) {
    console.log(err);
    if (offer == null) {
      res.redirect("/");
    } else {
      res.redirect(`offers/${offer.id}`);
    }
  }
});

// save image function
function saveImage(offer, imageEncoded) {
  if (imageEncoded == null) return;
  const image = JSON.parse(imageEncoded);
  if (image != null && imageMimeTypes.includes(image.type)) {
    offer.offerImage = new Buffer.from(image.data, "base64");
    offer.offerImageType = image.type;
  }
}

module.exports = router;
