const mongoose = require("mongoose");

const hospital = new mongoose.Schema({
  name: String,
  registerNo: String,
  certNo: String,
  gstNo: String,
  email: String,
  password: String,
  phone: String,
  approvalStatus: String,
  place: String,
  branch: String,
  speacility: String,
});

const Hospital = mongoose.model("hospitals", hospital); //hospital model
module.exports = Hospital;
