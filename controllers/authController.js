const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//error handling
handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  if (err.code === 11000) {
    errors.email = "That email is already in use";
    return errors;
  }

  return errors;
};

//signup
module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  //   res.status(400).json({ error: "Signups are closed" });

  try {
    const user = await User.create({ email, password });
    res.status(201).json(user);
    console.log("added new user to db");
  } catch (err) {
    const errors = handleErrors(err);
    console.log(errors);
    res.status(400).json(errors);
  }
};

//login
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  console.log("got a request with:");
  console.log(req.body);

  // EMAIL EXISTS in DB??
  const user = await User.findOne({ email: email });
  if (!user) return res.status(400).json("Email or Password is incorrect");

  // PASSWORD matches in DB??
  bcrypt.compare(password, user.password).then((pass) => {
    if (pass) {
      console.log(pass);
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      res.header("auth-token", token).send({ token });
      console.log("sent token");
    } else {
      console.log("invalid pass");
      return res.status(400).json("Password is incorrect");
    }
  });
};

//JWT verification
module.exports.verify = async (req, res) => {
  //   const token = req.header("auth-token");
  //   if (!token) return res.status(401).send({ access: false });
  let tokenObject = Object.values(req.body)[0];
  let token = tokenObject?.token;
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    console.log("VALID TOKEN");
    res.status(200).send({ token: "valid" });
  } catch (err) {
    console.log(err);
    res.status(401).send({ token: "invalid" });
  }
};
