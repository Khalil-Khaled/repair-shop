const express = require("express");
const router = express.Router();
const Offer = require("../models/offer");
const imageMimeTypes = ["image/jpeg", "image/png"];

// All offers route
router.get("/", async (req, res) => {
  let query = Offer.find();
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
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
router.get("/new", (req, res) => {
  res.render("offers/new", {
    offer: new Offer(),
    errorMessage: "",
  });
});

// create offer route
router.post("/", async (req, res) => {
  const offer = new Offer({
    name: req.body.name,
    price: req.body.price,
    discount: req.body.discount,
    issueDate: new Date(req.body.issueDate),
    expirationDate: new Date(req.body.expirationDate),
  });
  saveImage(offer, req.body.image);
  console.log(offer);
  try {
    const newOffer = await offer.save();
    //res.redirect(`offers/${newOffer.id}`);
    res.redirect("offers");
  } catch (err) {
    console.log(err);
    res.render("offers/new", {
      offer: offer,
      errorMessage: "Error Creating the offer",
    });
  }
});

function saveImage(offer, imageEncoded) {
  if (imageEncoded == null) return;
  const image = JSON.parse(imageEncoded);
  if (image != null && imageMimeTypes.includes(image.type)) {
    offer.offerImage = new Buffer.from(image.data, "base64");
    offer.offerImageType = image.type;
  }
}

module.exports = router;
