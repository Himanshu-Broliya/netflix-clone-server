require('./db/config');
require('dotenv').config()
const User = require('./db/User');
const  bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const cors = require('cors');
const express = require('express');
const app = express();
const KEY = process.env.KEY;
const PORT = process.env.PORT;



app.use(express.json());
app.use(cors());


app.post( '/register', async (req, resp) => {
    try{
        const userExist = await User.findOne({email: req.body.email});
        if(userExist){
            resp.send({status:false,msg:"User exist please login!"});
        }else{
            let newUser = new User(req.body);
            let result =  await newUser.save();
            jwt.sign({result},KEY , {expiresIn:"2h"},(err,token)=>{
                if(err){
                    console.log({status:false,msg:"Something went wrong. Please try again later!"})
                }else{
                    resp.send({status:true, result, auth:token});
                }
            })
        }
    }catch(err){
        resp.send({status:false,msg:"Server Error. Please try again later!"})
    }
})

app.post('/login',async (req,resp)=>{
    let user = await User.findOne({ email : req.body.email });
    if(user){
        let pass = await bcrypt.compare(req.body.password , user.password);
        if(pass){
            jwt.sign({user},KEY , {expiresIn:"2h"},(err,token)=>{
                if(err){
                    resp.send({status:false,msg:"Something went wrong. Please try  again later!"})
                }else{
                    resp.send({status:true,user , auth:token})
                }
            })
        }
        else{
           resp.send({status:false,msg:"Password is incorrect!"})
        }
    }else{
        resp.send({status:false,msg:"Email not exist!"})
    }
})


app.listen(PORT,()=>{
    console.log("working");
})
