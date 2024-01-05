const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
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
  confirmationToken: {
    type: String,
    isConfirmed: { type: Boolean, default: false },
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
