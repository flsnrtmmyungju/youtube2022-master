import multer from "multer";
import multerS3 from "multer-s3";
var aws = require('aws-sdk')
var s3 = new aws.S3({
  credentials:{
    accessKeyId : process.env.AWS_ID,
    secretAccessKey :process.env.AWS_SECRET,
  }
})

const multerUploader = multerS3({
  s3: s3,
  bucket: 'wetube-mjtest'
})

export const localsMiddleware = (req, res, next) => {  
    res.locals.loggedIn = Boolean(req.session.loggedIn);//아래와같음+ undifind일수도있으니 true false체크위해Boolean 
    // if(res.locals.loggedIn){
    //   res.locals.loggedIn= true
    // }
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {}; //undefine 일수있으니 || {}
    next();
  };
  
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Log in first.");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

//dest: 입력한 폴더에 파일저장
export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
  storage:multerUploader,
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 10000000,
  },
  storage:multerUploader,

});