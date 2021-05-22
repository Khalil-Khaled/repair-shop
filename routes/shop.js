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
  res.render("shop/shop", {
    items,
    offers,
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

module.exports = router;
