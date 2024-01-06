const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: [true, "Please Include your name"],
  },
  email: {
    type: String,
    required: [true, "Please Include your email"],
  },
  phone: {
    type: String,
    required: [true, "Please Include your phone number"],
  },
  password: {
    type: String,
    required: [true, "Please Include a valid password"],
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
    process.env.SESSION_SECRET,
    { expiresIn: "7d" }
  );
  return verificationToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
