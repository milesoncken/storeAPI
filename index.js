//configure .env
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");

//just realized i made this public LOL
const stripe = require("stripe")(
  "sk_test_51NBkbADWTgReD80GtHHeZFD8wRwDu18IiAKj2c8CKggJiO2wbYGSNhlRPuKRyNcLbrwYCuQ4Eaag2lnCS383BJAB00ukxzHTjJ"
);

//create express applicaiton
const app = express();
app.use(express.json());

//db imports
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/productModel");
const jwt = require("jsonwebtoken");

//route imports
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const shopRoutes = require("./routes/shopRoutes");

//connect to mongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("CONNECTED TO DATABASE"))
  .catch((err) => {
    console.log(err);
  });

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

app.use(authRoutes);
app.use(productRoutes);

app.listen(process.env.PORT, () => {
  console.log("server is online");
});
