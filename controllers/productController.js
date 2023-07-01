const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");

//create a product in the DB
module.exports.products_post = async (req, res) => {
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
};

//get all of the products
module.exports.products_get = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//get a single product
module.exports.product_get = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(parseInt(id));
    const product = await Product.find({ id: parseInt(id) });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
