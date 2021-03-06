const User = require("../models/usersModel");
const ErrorHandler = require("../utils/errorHandler");
const handleAsync = require("../middleware/catchAsyncError");
const { json } = require("body-parser");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const sendEmail = require("../utils/sendEmail");
const requestIp = require('request-ip');
// Creating a user account
exports.registerUser = handleAsync(async (req, res, next) => {

  console.log(req.body.avatar)
  let my_public_id;
  let my_url;
  if(req.body.avatar!=="/Profile.png"){
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "profilePics",
    width: 150,
    crop: "scale",
  });
  my_public_id=myCloud.public_id;
  my_url=myCloud.secure_url
}
  const { name, email, password,contactNumber } = req.body;
  
  if(!my_public_id){
 my_public_id="profilePics/mbkx5p4bbazbkg4ddy76";
 my_url="https://res.cloudinary.com/gulatianil410/image/upload/v1645982228/profilePics/mbkx5p4bbazbkg4ddy76.jpg"
  }
  else{

  }

  
  const user = await User.create({
    name,
    email,
    password,
    contactNumber,
    avatar: {
      public_id: my_public_id,
      url: my_url,
    },
  });
let message = `${name},Thank you for signing up at E-mart.\nLooking forward to serve you`
try{  
await sendEmail({
    email,
    subject: `Welcome To E-mart`,
    message,
  });
}
catch(e){
  console.log(e.message)
}
  sendToken(user, 201, res);
});

exports.loginUser = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and Password Required"));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  var clientIp = requestIp.getClientIp(req);
  let message = `${user.name}, A new login to your account from IP: ${clientIp} is detected\nIf not done by you we recommend you to change your password immediately`
 try{
  await sendEmail({
    email,
    subject: `New Login Detected`,
    message,
  });
}
catch(e){
  console.log(e.message)
}
  sendToken(user, 200, res);
});

exports.logout = handleAsync(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// forgot password
exports.forgotPassword = handleAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //get reset password token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\nIf you have not requested this then please ignore`;

  try {
    await sendEmail({
      email: user.email,
      subject: `E-mart Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

//reset password

exports.resetPassword = handleAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Reset Token is invalid or has expired", 404));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password doesn't match", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  let message = `${user.name},You successfully recovered your login password for Emart.\nIf not done by you change your password immediately`
  try{  
  await sendEmail({
      email,
      subject: `Password Recovered Successfully`,
      message,
    });
  }
  catch(e){
    console.log(e);
  }
  sendToken(user, 200, res);
});

//Get user details

exports.getUserDetails = handleAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user password
exports.updatePassword = handleAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password doesn't match", 400)
    );
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

//Update user profile
exports.updateProfile = handleAsync(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    contactNumber:req.body.contactNumber
  };
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "profilePics",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
  });
});

// get all users (admin)
exports.getAllUsers = handleAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

// get single users (admin)
exports.getSingleUser = handleAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`user does not exist with Id: ${req.params.id}`, 401)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//modify user profile(name,email,role,contactNumber) --Admin
exports.updateUserProfile = handleAsync(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    contactNumber:req.body.contactNumber
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
  });
});
//Delete some user's profile --Admin
exports.deleteUser = handleAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`user does not exist with Id: ${req.params.id}`, 400)
    );
  }

  await user.remove();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
