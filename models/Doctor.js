const mongoose = require("mongoose");

const doctor = new mongoose.Schema({
  Name: String,
  speciality: String,
  hospital: mongoose.Schema.Types.ObjectId,
});

const Doctor = mongoose.model("doctors", doctor); //doctor model

module.exports = Doctor;
