const express = require("express");
const router = express.Router();
const listingModel = require("../models/listing.models");
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/expressErrors");
const { isLoggedIn } = require("../middlewares/auth.middleware");

// Validation middleware
const validatelisting = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((er) => er.message).join(",");
    throw new ExpressError(400, errmsg);
  }
  next();
};

// ================= ROUTES =================

// Get all listings
router.get("/", isLoggedIn, async (req, res) => {
  const allListings = await listingModel.find({});
  res.render("home", { allListings });
});

// Create new listing
router.get("/new", isLoggedIn, (req, res) => {
  res.render("createlisting");
});

router.post(
  "/new",
  isLoggedIn,
  validatelisting,
  wrapAsync(async (req, res) => {
    let newListings = new listingModel(req.body.listing);
    await newListings.save();
    res.redirect("/listing");
  })
);

// Show single listing
router.get(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let readlisting = await listingModel.findById(id).populate("reviews");
    res.render("viewlisting", { readlisting });
  })
);

// Edit listing
router.get(
  "/edit/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let readlisting = await listingModel.findById(id);
    res.render("editlisting", { readlisting });
  })
);

// Update listing
router.put(
  "/update/:id",
  isLoggedIn,
  validatelisting,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await listingModel.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listing/${id}`);
  })
);

// Delete listing
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await listingModel.findByIdAndDelete(id);
    res.redirect("/listing");
  })
);

module.exports = router;
