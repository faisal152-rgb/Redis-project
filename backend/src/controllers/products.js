const productModel = require("../models/product");
const { uploadFile, deleteFromImage } = require("../services/storage");
const userModel = require("../models/auth");
const redis = require("../config/redis");

/*
*_    Method Type: POST
*_    Route: /api/products/create
*_    Description: Create product
*/

async function createProduct(req, res) {
    try {
        const sellerId = req.user.id;
        const seller = await userModel.findById(sellerId);
        if (!seller) {
            return res.status(401).json({
                message: "Unauthorized",
                status: "Failed"
            });
        }
        const { title, description, price, stock, category } = req.body;
        const image = req.file;
        const productID = req.params.productID;
        await redis.del(`allproduct:${productID}`);
        if (!image) {
            return res.status(400).json({
                message: "Image file is required. Send it as multipart/form-data using the 'image' field.",
                status: "Failed"
            });
        }
        if (!title || !description || !price || !stock || !category) {
            return res.status(400).json({ message: "All fields are required", status: "Failed" });
        }
        const result = await uploadFile(
            image,
            title,
            "image/jpeg",
            "products"
        );

        const product = new productModel({
            title,
            description,
            price,
            imageUrl: {
                url: result.url,
                name: result.name,
                fileId: result.fileId,
                width: result.width,
                height: result.height,
            },
            stock,
            category,
            user: sellerId
        });

        await product.save();
        return res.status(201).json({
            message: "Product created successfully",
            data: {
                id: product._id,
                title: product.title,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                imageUrl: product.imageUrl,
            }

        });
    } catch (error) {
        console.log("Error creating product:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

/*
*_    Method Type: GET
*_    Route: /api/products/all
*_    Description: Get all products
*/

async function getAllProducts(req, res) {
    try {
        const sellerId = req.user.id;
        const productdata = await redis.get(`allproduct:${sellerId}`);
        if (productdata) {
            return res.status(200).json({
                message: "Products fetched successfully",
                status: "Success",
                data: JSON.parse(productdata)
            });
        }
        const products = await productModel.find({
            user: sellerId
        });
        if (!products) {
            return res.status(404).json({ message: "Products not found", status: "Failed" });
        }
        await redis.set(`allproduct:${sellerId}`, JSON.stringify(products));
        return res.status(200).json({
            message: "Products fetched successfully",
            data: {
                title: product.title,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                imageUrl: product.imageUrl,
            }
        });
    } catch (error) {
        console.log("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

/*
*_    Method Type: GET
*_    Route: /api/products/single/:id
*_    Description: Get product by ID
*/

async function getProductById(req, res) {
    try {
        const { productID } = req.params;
        const productData = await redis.get(`product:${productID}`);
        if (productData) {
            return res.status(200).json({
                message: "Product fetched successfully",
                status: "Success",
                data: JSON.parse(productData)
            });
        }
        const product = await productModel.findById(productID);
        if (!product) {
            return res.status(404).json({ message: "Product not found", status: "Failed" });
        }
        await redis.set(`product:${productID}`, JSON.stringify(product));
        return res.status(200).json({
            message: "Product fetched successfully",
            status: "Success",
            data: {
                id: product._id,
                title: product.title,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                imageUrl: product.imageUrl,
            }
        });
    } catch (error) {
        console.log("Error fetching product:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}

/*
*_    Method Type: PATCH
*_    Route: /api/products/update/:id
*_    Description: Update product by ID
*/

async function updateProduct(req, res) {
    try {
        const sellerId = req.user.id || req.user._id;
        const seller = await userModel.findById(sellerId);
        if (!seller || seller.role !== "seller") {
            return res.status(401).json({
                message: "Unauthorized",
                status: "Failed"
            })
        }
        const { productID } = req.params;
        const product = await productModel.findById(productID);
        if (!product) {
            return res.status(404).json({ message: "Product not found", status: "Failed" });
        }
        const { title, description, price, stock, category } = req.body;
        const image = req.file;
        if (!title || !description || !price || !stock || !category || !image) {
            return res.status(400).json({ message: "All fields are required", status: "Failed" });
        }



        if (fileId) {
            await deleteFromImage(fileId);
        }

        const result = await uploadToImage(
            image,
            title,
            "image/jpeg",
            "products"
        );

        const updatedProduct = new productModel({
            title,
            description,
            price,
            image: {
                url: result.url,
                name: result.name,
                fileId: result.fileId,
                width: result.width,
                height: result.height,
            },
            stock,
            category,
            user: sellerId
        });
        await updatedProduct.save();
        return res.status(201).json({ message: "Product updated successfully", status: "Success", data: updatedProduct });
    } catch (error) {
        console.log("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}
/*
*_    Method Type: DELETE
*_    Route: /api/products/delete/:id
*_    Description: Delete product by ID
*/

async function deleteProduct(req, res) {
    try {
        const sellerId = req.user.id || req.user._id;
        const seller = await userModel.findById(sellerId);
        if (!seller || seller.role !== "seller") {
            return res.status(401).json({
                message: "Unauthorized",
                status: "Failed"
            })
        }
        const { productID } = req.params;
        if (!productID) {
            return res.status(404).json({ message: "Product not found", status: "Failed" });
        }
        const product = await productModel.findByIdAndDelete(productID);
        if (!product) {
            return res.status(404).json({ message: "Product not found", status: "Failed" });
        }
        await deleteFromImageKit(product.image.fileId);
        return res.status(200).json({ message: "Product deleted successfully", status: "Success", data: product });
    } catch (error) {
        console.log("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error", status: "Failed" });
    }
}
module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };
