//jshint esversion:6
require('dotenv').config();

const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const encrypt = require("mongoose-encryption");

async function Main() {
    await mongoose.connect("mongodb+srv://melrain:wszy1989@cluster0.azcsaaz.mongodb.net/secretDB");
    console.log("已连接上数据库");
}

Main().catch((error) => {
    console.log(error);
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.secret,encryptedFields: ["password"]});

const User = mongoose.model("user", userSchema);


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.listen(3000, () => {
    console.log("server is starting at port:3000");
});

app.route("/").get((req, res) => {
    res.render("home.ejs");
});

app.route("/register").get((req, res) => {
    res.render("register.ejs");
}).post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }).then((result) => {
        console.log("此处可以解密密码:"+result.password);
        if (username.length > 3 && password.length > 3) {
            if (result === null) {

                const newUser = new User({
                    email: username,
                    password: password
                });

                newUser.save().then(()=>{
                    console.log("注册成功")
                    res.render("secrets.ejs");
                }).catch((error)=>{
                    console.log(error);
                    res.send(error);
                })

            } else {
                console.log("已有账号，请直接登录");
                res.send("已有账号，请直接登录");
            }
        } else {
            console.log("账号密码长度不对");
            res.send("账号密码长度不对");
        };


    })
});


app.route("/login").get((req, res) => {
    res.render("login.ejs");
});



