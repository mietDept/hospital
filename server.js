const express=require('express');
const app=express();
const dot=require('dotenv');
dot.config();
const mongoose=require('mongoose');//mongodb database
const bodyparser=require('body-parser');
app.use(bodyparser.json());//data in json
app.use(bodyparser.urlencoded({extended:true}));
const mongourl=process.env.mongo;
mongoose.connect(mongourl, {useNewUrlParser: true,useUnifiedTopology: true})
.then(()=>{console.log("connected.....")})//database connection
.catch((err)=>{console.log(err)})
//hospital list schema
const hospital=new mongoose.Schema({
    name:String,
    registerNo:String,
    certNo:String,
    gstNo:String,
    email:String,
    password:String,
    phone:Number,
    approvalStatus:String,
    place:String,
    branch:String,
    speacility:String,
    isHospital:Boolean
});
//patient list schema
const patient=new mongoose.Schema({
    Name:String,
    AdhaarNo:Number,
    PhoneNumber:Number,
    email:String,
    password:String,
    District:String,
    state:String,
    address:String,
    isPatient:Boolean
});
//doctor list schema
const doctor=new mongoose.Schema({
    Name:String,
    speciality:String,
    hospital:mongoose.Schema.Types.ObjectId,
    certificate:Buffer,
})
const Patient=new mongoose.model("patient",patient);//patient model
const Hospital=mongoose.model("hospitals",hospital);//hospital model
const Doctor=mongoose.model("doctors",doctor);//doctor model
//home page
app.get('/',(req,res)=>{
    res.send("home page");
})
app.get('/patientsign',(req,res)=>{res.sendFile(__dirname+'/doctorsign.html');})
//patient login
app.get('/patientlogin',(req,res)=>{
    Patient.find({email:req.body.email},(err,resp)=>{
        if(resp.password==req.body.password){
            res.send({message:"logged in"})
        }
        else{
            res.send({message:"not logged in"})
        }
    })
})
//hospital login
app.get('/hospitallogin',(req,res)=>{
    Hospital.find({email:req.body.email},(err,re)=>{
        if(re.password==req.body.password){
            res.send({message:"logged in"})
        }
        else{
            res.send({message:"not logged in"})
        }
    })
    
});
//hospital register
app.post('/register',(req,res)=>{
    var register=Hospital({
        name:req.body.name,
        registerNo:req.body.registerno,
        certNo:req.body.certno,
        gstNo:req.body.gstno,
        email:req.body.email,
        password:pass.generate(req.body.password),
        phone:req.body.phone,
        approvalStatus:req.body.approval,
        place:req.body.place,
        branch:req.body.branch,
        speacility:req.body.speciality,
    });
    register.save();
    res.send({message:"hospital account created"});
    
});
//patient register
app.post('/patientregister',(req,res)=>{
    var sav=Patient({
        Name:req.body.name,
        AdhaarNo:req.body.adhaarno,
        PhoneNumber:req.body.phone,
        email:req.body.email,
        password:pass.generate(req.body.password),
        District:req.body.district,
        state:req.body.state,
        address:req.body.address,
     });
    sav.save();
    res.send("patient created");
});
//
app.post('/doctors',(req,res)=>{
var doc=Doctor({
    Name:req.body.name,
    speciality:req.body.speacility,
    hospital:req.body.hospital,
})
doc.save()
.then(res.send("created"))
.catch((err)=>{console.log(err)})
});
app.get("/doctor",(req,res)=>{
    Doctor.find({hospital:req.body.hospitalid},(err,resd)=>{
        res.send({resd})})
})
app.listen(9000);
