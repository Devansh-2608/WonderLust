const express = require("express");
const router = express.Router(); 
const wrapAsync = require("../utilitis/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleWare.js");

const {signup , rendersignupform , renderloginform , login , logout} = require("../controllers/user.js");

router
  .route("/signup")
  .get(rendersignupform)
  .post(wrapAsync(signup));

router
  .route("/login")
  .get(renderloginform)
  .post(saveRedirectUrl,passport.authenticate('local',{failureRedirect : '/login', failureFlash : true}),login);

  router.get("/logout",logout);

module.exports  = router;



// router.get("/signup",rendersignupform);


// router.post("/signup",wrapAsync(signup));

// router.get("/login",renderloginform);

// router.post("/login",saveRedirectUrl,passport.authenticate('local',{failureRedirect : '/login', failureFlash : true}),login);

// router.get("/logout",logout);