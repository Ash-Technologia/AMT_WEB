const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [orderItemSchema],
        shippingAddress: {
            fullName: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            pincode: String,
        },
        paymentMethod: { type: String, enum: ['booking', 'cod'], default: 'booking' },
        paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
        orderStatus: {
            type: String,
            enum: ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Placed',
        },
        trackingInfo: {
            carrier: { type: String, default: '' },
            trackingId: { type: String, default: '' },
            trackingUrl: { type: String, default: '' },
        },
        deliveryEstimate: { type: String, default: '' },
        couponApplied: {
            code: { type: String, default: '' },
            discount: { type: Number, default: 0 },
        },
        subtotal: { type: Number, required: true },
        shippingCharge: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
