const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


let createReview = async (req,res) =>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  newReview.author = req.user._id;  //to ensure that the review is created by someone.
  listing.review.push(newReview);

  await newReview.save();
  await listing.save();
  // console.log("Saved!");
  req.flash("success","New Review Added");
  res.redirect(`/listings/${listing._id}`);
};

let destroyReview = async (req,res)=>{
  let {id , reviewId} = req.params; 
  // if (!review.author.equals(req.user._id)) {
  // req.flash("error", "Not allowed");
  // return res.redirect("back");
  // }
  await Listing.findByIdAndUpdate(id,{$pull : {review : reviewId}});
  req.flash("success","Review Deleted");
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
};

module.exports = {createReview, destroyReview};