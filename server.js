const express = require("express");
const app = express();
const { Types } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dot = require("dotenv");
dot.config();
const mongoose = require("mongoose"); //mongodb database
mongoose.Promise = require("bluebird");
const bodyparser = require("body-parser");
app.use(bodyparser.json()); //data in json
app.use(bodyparser.urlencoded({ extended: true }));

const Hospital = require("./models/Hospital.js");
const Patient = require("./models/Patient.js");
const Doctor = require("./models/Doctor.js");

const mongourl = process.env.mongo;
mongoose
  .connect(mongourl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected.....");
  }) //database connection
  .catch((err) => {
    console.log(err);
  });

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

app.get("/", (req, res) => {
  res.send("home page");
});

app.get("/patientLogin", (req, res) => {
  Patient.findOne({ email: req.body.email }, async (err, resp) => {
    if (resp != undefined) {
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
app.get("/hospitalLogin", async (req, res) => {
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
  Hospital.findOne({ email: req.body.email }, (err, hospital) => {
    if (hospital === undefined) {
      var register = Hospital({
        name: req.body.name,
        registerNo: req.body.registerNo,
        certNo: req.body.certNo,
        gstNo: req.body.gstNo,
        email: req.body.email,
        password: await bcrypt.hash(
          req.body.password,
          await bcrypt.genSalt(10)
        ),
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
    } else {
      res.send({ message: "Email already exist" });
    }
  });
}); //workflow
//patient register
app.post("/patientRegister", async (req, res) => {
  Patient.findOne({ email: req.body.email }, (err, user) => {
    if (user === undefined) {
      var sav = Patient({
        Name: req.body.name,
        AdhaarNo: req.body.adhaarNo,
        PhoneNumber: req.body.phone,
        email: req.body.email,
        password: await bcrypt.hash(
          req.body.password,
          await bcrypt.genSalt(10)
        ),
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
    } else {
      res.send({ message: "Email already exist" });
    }
  });
});
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
    { hospital: Types.ObjectId(req.body.hospitalId) },
    (err, resd) => {
      res.send({ doctor: resd });
    }
  );
});

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3000;

app.listen(port, host, () =>
  console.log(
    `server is successfully listenning at host: ${host}, port: ${port}`
  )
);
