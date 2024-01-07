const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: [true, "Veuillez saisir votre nom"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Veuillez saisir votre adresse email"],
    unique: true,
  },
  phone: {
    type: String,
    //required: [true, "Please Include your phone number"],
  },
  password: {
    type: String,
    required: [true, "Veuillez saisir votre mot de passe"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
});

userSchema.methods.generateVerificationToken = function () {
  const user = this;
  const verificationToken = jwt.sign(
    { ID: user._id },
    process.env.CONFIRM_TOKEN,
    { expiresIn: "7d" }
  );
  return verificationToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
