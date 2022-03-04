const express = require("express");
const app = express();
const { Types } = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dot = require("dotenv");
// const salt = await bcrypt.genSalt(8);
dot.config();
const mongoose = require("mongoose"); //mongodb database
const bodyparser = require("body-parser");
app.use(bodyparser.json()); //data in json
app.use(bodyparser.urlencoded({ extended: true }));
const mongourl = process.env.mongo;
mongoose
  .connect(mongourl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected.....");
  }) //database connection
  .catch((err) => {
    console.log(err);
  });
//hospital list schema
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
//patient list schema
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
//doctor list schema
const doctor = new mongoose.Schema({
  Name: String,
  speciality: String,
  hospital: mongoose.Schema.Types.ObjectId,
});
const Patient = new mongoose.model("patient", patient); //patient model
const Hospital = mongoose.model("hospitals", hospital); //hospital model
const Doctor = mongoose.model("doctors", doctor); //doctor model

const auth = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  console.log(token);
  jwt.verify(token, process.env.TOKEN_AUTH, (err, user) => {
    if (err) {
      return err;
    }
    req.user = user;
    next();
  });
};
//home page
app.get("/", (req, res) => {
  res.send("home page");
});

//patient login
app.get("/patientlogin", (req, res) => {
  Patient.findOne({ email: req.body.email }, async (err, resp) => {
    if (resp != undefined) {
      // console.log(resp);
      console.log(req.body.password, resp.password);
      var verification = await bcrypt.compare(req.body.password, resp.password);
      if (verification) {
        const token = jwt.sign({ id: resp._id }, process.env.TOKEN_AUTH, {
          expiresIn: "1d",
        });
        res.send({ message: "sign in successful", data: resp, token });
      } else {
        res.send({ message: "Invalid Password" });
      }
    } else {
      res.send({ message: "user does not exist" });
    }
  });
});
//hospital login
app.get("/hospitallogin", async (req, res) => {
  Hospital.findOne({ email: req.body.email }, async (err, re) => {
    if (re != undefined) {
      console.log(re);
      console.log(req.body.password, re.password);
      var verification = await bcrypt.compare(req.body.password, re.password);
      console.log(verification);
      if (verification) {
        const token = jwt.sign({ id: re._id }, process.env.TOKEN_AUTH, {
          expiresIn: "1d",
        });
        res.send({ message: "sign in successful", data: re, token });
      } else {
        res.send({ message: "Invalid Password" });
      }
    } else {
      res.send({ message: "user does not exist" });
    }
  });
});
//hospital register
app.post("/register", async (req, res) => {
  var register = Hospital({
    name: req.body.name,
    registerNo: req.body.registerno,
    certNo: req.body.certno,
    gstNo: req.body.gstno,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, await bcrypt.genSalt(10)),
    phone: req.body.phone,
    approvalStatus: req.body.approval,
    place: req.body.place,
    branch: req.body.branch,
    speacility: req.body.speciality,
  });
  register
    .save()
    .then(res.send({ message: "Hospital created Successfully" }))
    .catch((err) => {
      console.log(err);
    });
  res.send({ message: "hospital account created" });
}); //workflow
//patient register
app.post("/patientregister", async (req, res) => {
  var sav = Patient({
    Name: req.body.name,
    AdhaarNo: req.body.adhaarno,
    PhoneNumber: req.body.phone,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, await bcrypt.genSalt(10)),
    District: req.body.district,
    state: req.body.state,
    address: req.body.address,
  });
  sav
    .save()
    .then(res.send({ message: "Patient created successfully" }))
    .catch((err) => {
      console.log(err);
    });
  // res.send({ message: "patient created" });
});
//
app.post("/doctors", (req, res) => {
  var doc = Doctor({
    Name: req.body.name,
    speciality: req.body.speacility,
    hospital: req.body.hospital,
  });
  doc
    .save()
    .then(res.send("doctor created"))
    .catch((err) => {
      console.log(err);
    });
});
app.get("/doctor", (req, res) => {
  Doctor.find(
    { hospital: Types.ObjectId(req.body.hospitalid) },
    (err, resd) => {
      res.send({ doctor: resd });
    }
  );
});

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3000;

// server listening to the port
app.listen(port, host, () =>
  console.log(
    `server is successfully listenning at host: ${host}, port: ${port}`
  )
);
