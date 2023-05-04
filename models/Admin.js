const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const AdminSchema = new Schema({
    adminemail: {
        type: String,
        required: true,
    },
    adminpassword: {
        type: String,
        required: true,
    }


});


const Adminmodel = model("Admin", AdminSchema);

module.exports = Adminmodel;