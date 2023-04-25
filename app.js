const express = require('express');
const session = require('express-session')
const mongoose = require('mongoose');
const Item = require('./models/itemsModel')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
require('./auth')

const app = express();
app.use(express.json());

function isLoggedIn(req,res,next){
  req.user ? next() : res.sendStatus(401)
}

//connect to db
mongoose.set('strictQuery', false);
const Conn = async () => {
    try {
        const dbCon = 'mongodb://127.0.0.1:27017/bookly';
        await mongoose.connect(dbCon);
        console.log("Connection to database successful");
        
    } catch (error) {
        console.log(error);
    }
}

Conn();






app.use(session({
  secret: 'your secret key',
  resave: false, // set to false to avoid the warning
  saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());

app.get('/',(req,res) => {
  res.send('<a href="/google">Authenticate with Google</a>')
});

app.get('/google',
  passport.authenticate('google', { scope: ['email','profile'] }));

app.get('/google/callback',
  passport.authenticate('google', { successRedirect: '/items', failureRedirect: '/google/failure' }));

  app.get('/google/failure',(res,req)=>{
    res.send("Hello there!");
  });
  

// Define the route handler for retrieving items with pagination
app.get('/items', isLoggedIn, async (req, res) => {
 
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const count = await Item.countDocuments();
  const items = await Item.find().skip(skip).limit(limit);
  res.json({
    totalItems: count,
    currentPage: page,
    itemsPerPage: limit,
    items: items
  });
});

app.get('/logout', function(req, res){
  req.logout(function(){
    res.redirect('/');
  });
});


  const PORT = 3500;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
