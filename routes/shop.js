const express = require("express");
const router = express.Router();
const { ItemDB } = require("../models/item");
const offer = require("../models/offer");

// Shop Page
router.get("/", async (req, res) => {
  const items = await ItemDB.find();
  const bodyParts = items.filter(
    (item) => item.category.toLowerCase() === "body part"
  );
  const lights = items.filter(
    (item) => item.category.toLowerCase() === "lights"
  );
  const accessories = items.filter(
    (item) => item.category.toLowerCase() === "accessory"
  );
  const engines = items.filter(
    (item) => item.category.toLowerCase() === "engines"
  );
  const offers = await offer
    .find()
    .populate("offerItems")
    .populate("offerFreeItems");
  // console.log(offers);
  let featuredOffers = offers.sort((offerA, offerB) => {
    countA = offerA.cartCount;
    countB = offerB.cartCount;
    if (countA < countB) return 1;
    if (countA > countB) return -1;
    else return 0;
  });
  featuredOffers = featuredOffers.slice(0, 4);
  // console.log(featuredOffers);
  let latestOffers = offers.sort((offerA, offerB) => {
    dateA = new Date(offerA.issueDate);
    dateB = new Date(offerB.issueDate);
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;
    else return 0;
  });
  latestOffers.forEach((offer) => {
    console.log(offer.issueDate);
  });
  // console.log(latestOffers);
  latestOffers = latestOffers.slice(0, 4);
  res.render("shop/shop", {
    items,
    featuredOffers,
    latestOffers,
    bodyParts,
    lights,
    accessories,
    engines,
  });
});

router.post("/addOfferToCart", async (req, res) => {
  try {
    const addedOffer = await offer.findById(req.body.id);
    addedOffer.cartCount++;
    await addedOffer.save();
  } catch (error) {
    console.log(error);
  }
  res.status(200);
  res.redirect("/shop");
});

router.post("/addItemToCart", async (req, res) => {
  try {
    const addedItem = await ItemDB.findById(req.body.id);
    addedItem.cartCount++;
    await addedItem.save();
  } catch (error) {
    console.log(error);
  }
  res.status(200);
  res.redirect("/shop");
});

module.exports = router;
