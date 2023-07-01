const { isEmail } = require("validator");

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter an Email"],
    unique: [true, "Email is already in use"],
    lowercase: true,
    validate: [isEmail, "Please enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Password must at least 6 characters"],
  },
});

// password hashing

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();

  this.password = await bcrypt.hash(this.password, salt);
  console.log("salted password");

  next();
});

const User = mongoose.model("user", userSchema);

module.exports = User;
