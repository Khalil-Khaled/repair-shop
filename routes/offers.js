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
    query = query.where("name", req.query.name);
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
    const offer = await Offer.findById(req.params.id);
    console.log(offer.name);
    res.render("offers/edit", {
      offer: offer,
      errorMessage: "",
    });
  } catch {
    res.redirect("/offers");
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
