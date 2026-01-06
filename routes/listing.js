const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js")
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

const listingController = require("../controllers/listing.js");

//index route
router.get("/" , wrapAsync(listingController.index));
//new route
router.get("/new", isLoggedIn , listingController.rendernewform );

//show route
router.get("/:id",wrapAsync(listingController.showListings))

//create route
router.post("/" ,isLoggedIn,upload.single("listing[image]"),validateListing,
    wrapAsync(listingController.createListing)
);


//edit route
router.get("/:id/edit" ,isLoggedIn,isOwner,wrapAsync(listingController.editListing))

//update route
router.put("/:id" ,isLoggedIn,upload.single("listing[image]"),validateListing,isOwner,wrapAsync(listingController.updateListing))

//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing))



module.exports = router;