const User = require("../models/user.js");

//without try and catch we will land on a unknown page.
let signup = async (req,res)=>{
  try{
    let {username , email, password} = req.body;
    const newUser = new User({email,username});
    const registerUser = await User.register(newUser , password);
    console.log(registerUser);

    req.login(registerUser,(err)=>{   // automatic login
      if(err){
       return next(err);
      }
      req.flash("success", "Welcome To Wonderlust");
      res.redirect("/listings");
    })
  } catch (err){
    req.flash("error" , err.message);
    res.redirect("/signup");
  }
};

let rendersignupform = (req,res)=>{
  res.render("../views/users/signup.ejs");
}

let renderloginform = (req,res)=>{
  res.render("../views/users/login.ejs");
};

let login = async(req,res) =>{   // real anme sld be after login.
  req.flash("success","Welcome Back to WonderLust!");
  // res.redirect(req.session.redirectUrl);    // if we do this then after loginin the passport will autometically delete the session file but this if we store in local then it cat delete that file.

  // Debug: print the session
  // console.log("Session content:", req.session);
  let redirectUrl = res.locals.redirectUrl || "/listings";   // this line cause if we try to loggin from home page the islogged middleware i snot triggerd so nothing is saved in res.locals.redirect.
  res.redirect(redirectUrl);
};

let logout  = (req,res,next)=>{
  req.logOut((err)=>{
    if(err){
      next(err);
    }
    req.flash("success","You are loggedOut");
    res.redirect("/listings");
  })
};

module.exports = {signup , rendersignupform , renderloginform , login , logout};