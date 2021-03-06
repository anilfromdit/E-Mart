const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const handleAsync = require("../middleware/catchAsyncError");
const { handle } = require("express/lib/application");

//Create new order
exports.newOrder = handleAsync(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({ success: true, order });
});

//get single order --Admin
exports.getSingleOrder = handleAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler(`order not found with Id`, 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});
//get myOrder
exports.myOrders = handleAsync(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    order,
  });
});
//get All orders --Admin
exports.getAllOrders = handleAsync(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});
//update order status --Admin
exports.updateOrderStatus = handleAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this id", 404));
  }
  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (obj) => {
      await updateStock(obj.product, obj.quantity);
    });
  }
  if (order.orderStatus === "Refunded") {
    return next(new ErrorHandler("You have already Initiated Refunded for This Order", 400));
  }

  if (order.orderStatus === "Replaced") {
    return next(new ErrorHandler("You have already Replaced This Order", 400));
  }

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.Stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

//delete order
exports.deleteOrder = handleAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler(`order not found with Id`, 404));
  }
  await order.remove();
  res.status(200).json({
    success: true,
  });
});
