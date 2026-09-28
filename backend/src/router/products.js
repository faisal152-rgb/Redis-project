const express = require("express");
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/products');
const { authuser } = require("../middlewares/auth");
const upload = require("../middlewares/multer");


// CRUD endpoints
router.post("/create-products", authuser, upload.single("image"), createProduct);
router.get("/all-products", authuser, getAllProducts);
router.get("/single-product/:id", authuser, getProductById);
router.patch("/update-product/:id", authuser, upload.single("image"), updateProduct);
router.delete("/delete-product/:id", authuser, deleteProduct);

module.exports = router;
