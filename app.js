const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const favicon = require('serve-favicon');
const session = require('express-session');

var sesh;
var app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(session({secret:'Kiosk'}));
app.set('view engine', 'ejs');
const IMAGE_FOLDER = './images/'
var StatusEnum = Object.freeze({"open":1, "closed": 2});
var storage = multer.diskStorage({
    destination:IMAGE_FOLDER,
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({storage:storage}).array('eventPicturesInput', 1);
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'Zebra.mail.bot@gmail.com', // Your email id
    pass: '^.j\"gk)253{j]hCJr&gZ9N\'^Th5Fh3V9/K5gU^7aW64whrn(xwB+TksM)9ZQ'
  }
});

//TODO CHANGE THIS LATER
const db_config = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'Zebra123',
    database: 'kiosk'
};

var connection;

function handleDisconnect(){

  connection = mysql.createConnection(db_config);

  connection.connect((err) => {

    if(err) {
      console.log('Error connecting to database: ', err);
      setTimeout(handleDisconnect, 2000);
    }

    else {
      console.log('Connected');
    }

  });

  connection.on('error', function(err) {

    console.log('Database Error: ', err);

    if(err.code === 'PROTOCOL_CONNECTION_LOST'){
      handleDisconnect();
    }

    else{
      throw err;
    }

  });

}

handleDisconnect();

var server = app.listen(3005, "10.61.204.110", function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);

});


app.get('/', function(req, res) {

  sesh = req.session;

  if(sesh.logged_in == true){
    res.render('pages/logged_in');
  }

  else{
    res.render('pages/index');
  }

});



app.post('/logout', function(req, res) {

  sesh = req.session;
  sesh.logged_in = false;
  return res.redirect('/');

});



//TODO THIS IS THE METHOD TO LOGIN FOR ADMINISTRATOR NEED TO FIGURE OUT WHAT WE ARE DOING WITH LOGIN TODO
app.post('/auth', function(req, res) {



});


//TODO THIS IS THE METHOD TO DELETE AN EVENT NEED TO FIGURE OUT WHAT TO DO TODO
app.post('/deleteEvent', function(req, res) {



});


app.post('/declineEvent', function(req, res) {

});


app.post('/viewAcceptedEvents', function(req, res) {

});


app.post('/viewPendingEvents', function(req, res) {

});


app.post('/acceptEvent', function(req, res) {

});


app.post('/declineEvent', function(req, res) {

});


app.post('/addEventToPending', function(req, res) {



});


app.post('/uploadEventImage', function(req, res) {

});


function sendAcceptDeclineNotificationEmail(email, eventName, status){



}


function sendRegistrantListNotificationEmail(email, eventName, status){


}
