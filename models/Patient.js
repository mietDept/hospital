const mongoose = require("mongoose");

const patient = new mongoose.Schema({
  Name: String,
  AdhaarNo: Number,
  PhoneNumber: String,
  email: String,
  password: String,
  District: String,
  state: String,
  address: String,
});

const Patient = mongoose.model("patient", patient); //patient model

module.exports = Patient;
