const ErrorHander = require("../utils/errorhander.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const Product = require("../models/productModel");
const cloudinary = require("cloudinary");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");


exports.create = catchAsyncErrors(async (req, res, next) => {
    const { name, type, size, quantity, color, category, price } = req.body;

    if (!name) return next(new ErrorHander("Please enter name", 400));
    if (!type) return next(new ErrorHander("Please enter type", 400));
    if (!size) return next(new ErrorHander("Please select size", 400));
    if (!quantity) return next(new ErrorHander("Please enter quantity", 400));
    if (!color) return next(new ErrorHander("Please select color", 400));
    if (!category) return next(new ErrorHander("Please select category", 400));
    if (!price) return next(new ErrorHander("Please enter appropriate price", 400));
    if (!req.files) return next(new ErrorHander("Please select images", 400));

    const findProduct = await Product.find({ name });
    if (findProduct.length > 0) {
        return next(new ErrorHander("Product already exists", 400));
    }

    const findCategory = await Category.findById(category);
    if (!findCategory) {
        return next(new ErrorHander("Category dosen't exists", 400));
    }

    let images = [];
    if (req.files && req.files.images) {
        if (req.files.images.length > 0) images = req.files.images
        else images.push(req.files.images)
    }

    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i].tempFilePath, {
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    const productInfo = {
        name, type, size, quantity, color, category, price: Number(price),
        images: imagesLinks,
        user: req.user.id
    };

    const product = await Product.create(productInfo);

    res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
    });
});

exports.update = catchAsyncErrors(async (req, res, next) => {

    const { name, type, size, quantity, color, category, price } = req.body;

    if (!name) return next(new ErrorHander("Please enter name", 400));
    if (!type) return next(new ErrorHander("Please enter type", 400));
    if (!size) return next(new ErrorHander("Please select size", 400));
    if (!quantity) return next(new ErrorHander("Please enter quantity", 400));
    if (!color) return next(new ErrorHander("Please select color", 400));
    if (!category) return next(new ErrorHander("Please select category", 400));
    if (!price) return next(new ErrorHander("Please enter appropriate price", 400));

    let images = [];
    if (req.files && req.files.images) {
        if (req.files.images.length > 0) images = req.files.images
        else images.push(req.files.images)
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    const findProduct = await Product.find({ name: name, _id: { $ne: req.params.id } });
    if (findProduct.length > 0) {
        return next(new ErrorHander("Product already exists", 400));
    }

    const findCategory = await Category.findById(category);
    if (!findCategory) {
        return next(new ErrorHander("Category dosen't exists", 400));
    }

    const productInfo = {
        name, type, size, quantity, color, category, price: Number(price),
    };

    if (images.length > 0) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i].tempFilePath, {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        productInfo.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(req.params.id, productInfo, {
        new: true,
        useFindAndModify: false,
    });


    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
    });

});

exports.destroy = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product Delete Successfully",
    });
});

exports.get = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        product
    });
});

exports.getOutput = catchAsyncErrors(async (req, res, next) => {
    const matchObj = {};
    let query = [

        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "user",
                as: "categories"
            }
        },
        {
            $unwind: {
                path: "$categories",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "categories._id",
                foreignField: "category",
                as: "categories.products"
            }
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                email: { $first: "$email" },
                avatar: { $first: "$avatar" },
                password: { $first: "$password" },
                categories: { $push: "$categories" }

            }
        }

    ]
    User.aggregate(query).then((result) => {
        res.status(200).json(result);
    })
        .catch((error) => {
            console.log(error);
        });

});