const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const { listingSchema , reviewShema} = require("./schema.js");
const ExpressError = require('./utils/ExpressError.js');

module.exports.isLoggedIn = (req,res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(!req.isAuthenticated()){
        res.locals.redirectUrl =req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req , res, next)=>{
    let {id} = req.params
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You cannot edit this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
        let {error} =listingSchema.validate(req.body);
        if(error){
            throw new ExpressError(400,error);
        }
        else{
            next();
        }
}

module.exports.validateReview = (req,res,next)=>{
        let {error} =reviewShema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",")
            throw new ExpressError(400,error);
        }
        else{
            next();
        }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) {
            req.flash('error', 'Review not found');
            return res.redirect(`/listings/${id}`);
        }
        if (!res.locals.currUser || !res.locals.currUser._id) {
            req.flash('error', 'You must be signed in to perform this action');
            return res.redirect('/login');
        }
        if (!review.author.equals(res.locals.currUser._id)) {
            req.flash('error', 'You do not have permission to do that');
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        next(err);
    }
};

