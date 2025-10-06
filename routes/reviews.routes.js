const express = require("express");
const router = express.Router({ mergeParams: true });
const listingModel = require("../models/listing.models");
const reviewModel = require("../models/reviews.models");
const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/expressErrors");
const { isLoggedIn } = require("../middlewares/auth.middleware");

// Validation middleware
const validatereview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((er) => er.message).join(",");
    throw new ExpressError(400, errmsg);
  }
  next();
};

// Add review
router.post(
  "/",
  isLoggedIn,
  validatereview,
  wrapAsync(async (req, res) => {
    let listing = await listingModel.findById(req.params.id);
    let newReview = new reviewModel(req.body.review);

    listing.reviews.push(newReview._id);
    await newReview.save();
    await listing.save();
    res.redirect(`/listing/${req.params.id}`);
  })
);

// Delete review
router.delete(
  "/:reviewid",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id, reviewid } = req.params;
    await listingModel.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await reviewModel.findByIdAndDelete(reviewid);
    res.redirect(`/listing/${id}`);
  })
);

module.exports = router;
