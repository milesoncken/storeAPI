const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const express = require("express");

const stripe = require("stripe")(
  "sk_test_51NBkbADWTgReD80GtHHeZFD8wRwDu18IiAKj2c8CKggJiO2wbYGSNhlRPuKRyNcLbrwYCuQ4Eaag2lnCS383BJAB00ukxzHTjJ"
);
const app = express();

const mongoose = require("mongoose");
const Product = require("./models/productModel");
const User = require("./models/User");

const shopRoutes = require("./routes/shopRoutes");

// const path = require("path");

const { v4: uuidv4 } = require("uuid");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log(file);

    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

// app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("CONNECTED TO DATABASE"))
  .catch((err) => {
    console.log(err);
  });

app.post("/api/products", async (req, res) => {
  let tokenObject = Object.values(req.body)[0];
  let token = tokenObject?.token;
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    console.log("VALID");
    console.log(req.body);
    // res.status(200).send({ token: "valid" });
    try {
      const product = await Product.create(Object.values(req.body)[1]);
      console.log(product);
      res.status(200).json(product);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  } catch (err) {
    console.log(err);
    res.status(401).send({ token: "invalid" });
  }
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  res.send("image uploaded");
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(parseInt(id));
    const product = await Product.find({ id: parseInt(id) });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// app.post("/api/orders", async (req, res) => {
//   try {
//     console.log(req.json);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

app.post("/api/orders", async (req, res) => {
  const { products, userName, email } = req.body;

  try {
    const lineItems = await Promise.all(
      products.map(async (product) => {
        const item = await Product.findOne({ id: product.id });

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: product.count,
        };
      })
    );
    console.log(req.body);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/checkout/success",
      cancel_url: "http://localhost:3000",
    });
    res.send({ id: session.id });
  } catch (err) {
    console.log(err.message);
  }
});

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

app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  res.status(400).json({ error: "Signups are closed" });

  // try {
  //   const user = await User.create({ email, password });
  //   res.status(201).json(user);
  //   console.log("added new user to db");
  // } catch (err) {
  //   const errors = handleErrors(err);
  //   console.log(errors);
  //   res.status(400).json(errors);
  // }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("got a request with:");
  console.log(req.body);

  // IN LINE ERROR HANDLING BECUASE IM SLOW AND STUPID

  // EMAIL EXISTS in DB??
  const user = await User.findOne({ email: email });
  if (!user) return res.status(400).json("Email or Password is incorrect");

  // PASSWORD matches in DB??
  bcrypt.compare(password, user.password).then((pass) => {
    if (pass) {
      console.log(pass);
      //TODO: JWT
      // JWT assignment and sending to phone
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      res.header("auth-token", token).send({ token });
      console.log("sent token");
    } else {
      console.log("invalid pass");
      return res.status(400).json("Password is incorrect");
    }
  });
});

app.post("/api/verify", async (req, res) => {
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
});

app.listen(process.env.PORT, () => {
  console.log("server is online");
});
