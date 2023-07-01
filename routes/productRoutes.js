//initialize router
const { Router } = require("express");
const router = Router();

//authentication contoller import
const productController = require("../controllers/productController");

//routes to the middleware
router.post("/api/products", productController.products_post);
router.get("/api/products", productController.products_get);
router.get("/api/products:id", productController.product_get);

module.exports = router;
