const ErrorHander = require("../utils/errorhander.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const Category = require("../models/categoryModel");
const sendToken = require("../utils/jwtToken");
const cloudinary = require("cloudinary");


exports.create = catchAsyncErrors(async (req, res, next) => {
    const { name, type, } = req.body;

    if (!name) return next(new ErrorHander("Please enter category", 400));
    if (!type) return next(new ErrorHander("Please enter type", 400));
    if (!req.files) return next(new ErrorHander("Please select image", 400));

    const findCategory = await Category.find({ name });
    if (findCategory.length > 0) {
        return next(new ErrorHander("Category already exists", 400));
    }
    const myCloud = await cloudinary.v2.uploader.upload(req.files.image.tempFilePath, {
        folder: "categories",
        width: 150,
        crop: "scale",
    });

    const category = await Category.create({
        name,
        type,
        image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
        user: req.user.id
    });

    res.status(201).json({
        success: true,
        message: "Category created successfully",
        category,
    });
});

exports.update = catchAsyncErrors(async (req, res, next) => {

    const { name, type, } = req.body;
    if (!name) return next(new ErrorHander("Please enter category", 400));
    if (!type) return next(new ErrorHander("Please enter type", 400));

    let category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHander("Category not found", 404));
    }

    const categoryData = {
        name,
        type,
    }

    if (req.files && req.files.image) {
        await cloudinary.v2.uploader.destroy(category.image.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(req.files.image.tempFilePath, {
            folder: "categories",
            width: 150,
            crop: "scale",
        });
        categoryData.image = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    category = await Category.findByIdAndUpdate(req.params.id, categoryData, {
        new: true,
        useFindAndModify: false,
    });


    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
    });

});

exports.destroy = catchAsyncErrors(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorHander("Category not found", 404));
    }

    // Deleting Images From Cloudinary
    await cloudinary.v2.uploader.destroy(category.images.public_id);
    await category.remove();

    res.status(200).json({
        success: true,
        message: "Category Delete Successfully",
    });
});

exports.get = catchAsyncErrors(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorHander("Category not found", 404));
    }

    res.status(200).json({
        success: true,
        category
    });
});