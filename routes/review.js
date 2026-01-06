const express = require("express");
const Listing = require("../models/listing.js");
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require("../schema.js");
const Review = require("../models/reviews.js");

const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js")


const reviewController = require("../controllers/reviews.js");


//review route

router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview )
);

//delete route

router.delete("/:reviewId",isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;