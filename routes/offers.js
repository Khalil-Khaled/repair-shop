const express = require("express");
const router = express.Router();
const Offer = require("../models/offer");
const multer = require("multer");
const path = require("path");
const uploadPath = path.join("public", Offer.offerImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png"];
const fs = require("fs");
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

// All offers route
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const offers = await Offer.find(searchOptions);
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
router.post("/", upload.single("image"), async (req, res) => {
  const filename = req.file != null ? req.file.filename : null;
  const offer = new Offer({
    name: req.body.name,
    price: req.body.price,
    discount: req.body.discount,
    issueDate: new Date(req.body.issueDate),
    expirationDate: new Date(req.body.expirationDate),
    offerImageName: filename,
  });
  console.log(offer);
  try {
    const newOffer = await offer.save();
    //res.redirect(`offers/${newOffer.id}`);
    res.redirect("offers");
  } catch (err) {
    console.log(err);
    if (offer.offerImageName != null) removeOfferImage(offer.offerImageName);
    res.render("offers/new", {
      offer: offer,
      errorMessage: "Error Creating the offer",
    });
  }
});

function removeOfferImage(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (err) => {
    if (err) console.log(err);
  });
}

module.exports = router;
