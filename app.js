//jshint esversion:6
// require('dotenv').config();

const express = require("express");



const app = express();

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const session = require("express-session");

const passport = require("passport");

const LocalStrategies = require("passport-local");

const passportLocalMongoose = require("passport-local-mongoose");


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

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, { secret: process.env.secret,encryptedFields: ["password"]});

const User = mongoose.model("user", userSchema);

app.use(session({
    secret: "ourLittleSecret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategies(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());



app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


app.listen(3000, () => {
    console.log("server is starting at port:3000");
});

/////////////route/////////////////////////////////
app.route("/").get((req, res) => {
    res.render("home.ejs");
});


////////////*********register***********//////////////
app.route("/register",passport.authenticate("local")).get((req, res) => {

    res.render("register.ejs");

}).post((req, res) => {
 
    User.register({ username: req.body.username }, req.body.password, function (err, user) {

        if (err) {

            console.log("Error in registering.", err);

            res.redirect("/register");

        } else {



                console.log("user:" + user, 101);

                res.redirect("/secrets");



        }
    });

});

////////////*********secrets***********//////////////
app.route("/secrets").get((req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets.ejs");
    } else {
        res.redirect("/login");
    }
});

//////////*********login***********//////////////
app.route("/login").get((req, res) => {

    res.render("login.ejs");

}).post((req,res)=>{
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,(err)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, function () {
                
                res.redirect("/secrets");

            });
        }
    })
})


////////////*********logout***********//////////////
app.get("/logout", ((req, res) => {
    req.logout(() => {
        res.redirect("/");
    });

}));



