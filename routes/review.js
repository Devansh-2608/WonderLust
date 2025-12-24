const express = require("express");
const router = express.Router({mergeParams : true});   // whether route parameters from a parent router are accessible inside a child router

const wrapAsync = require("../utilitis/wrapAsync.js");
const ExpressError = require("../utilitis/expressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isReviewAuthor } = require("../middleWare.js"); 

const {createReview , destroyReview} = require("../controllers/reviews.js");


const validateReview = (req,res,next)=>{
  //joi error handling.
  let{error} = reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
}



//POST  Review Route.
router.post("/",isLoggedIn,validateReview,wrapAsync(createReview));

//Delete Review Route 
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(destroyReview));

module.exports = router;