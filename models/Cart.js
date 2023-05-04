const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CartSchema = new Schema({
    img: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        require: true,
    },
    code: {
        type: String,
        require: true,
    },
    view: {
        type: String,
        require: true,
    }





});


const Cartmodel = model("Cart", CartSchema);

module.exports = Cartmodel;