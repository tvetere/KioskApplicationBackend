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
var upload = multer({storage:storage}).array('pictureInput', 1);
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

var server = app.listen(3005, "10.61.204.102", function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);

});


app.get('/', function(req, res) {

  sesh = req.session;

  if(sesh.logged_in == true){
    res.render('logged_in');
  }

  else{
    res.render('index');
  }

});



app.post('/logout', function(req, res) {

  sesh = req.session;
  sesh.logged_in = false;
  return res.redirect('/');

});



//TODO THIS IS THE METHOD TO LOGIN FOR ADMINISTRATOR NEED TO FIGURE OUT WHAT WE ARE DOING WITH LOGIN TODO
app.post('/auth', function(req, res) {

  sesh = req.session;
  var username = req.body.inputEmail;
  var password = req.body.inputPassword;
  if(username === "Administrator"  && password === "Zebra123"){
    sesh.logged_in = true;
  }
  return res.redirect('/');

});


//TODO THIS IS THE METHOD TO DELETE AN EVENT NEED TO FIGURE OUT WHAT TO DO TODO
app.post('/deleteEvent', function(req, res) {

  var query = "DELETE FROM `accepted_events` WHERE `eventID` = " + req.body.eventID;
  connection.query(query, function(err, rows){

    if(err){
      throw(err);
    }

  });

  var query = "DELETE FROM `people` WHERE `eventID` = " + req.body.eventID;
  connection.query(query, function(err, rows){

    if(err){
      throw(err);
    }

  });

  return res.redirect('/');

});


app.post('/declineEvent', function(req, res) {

  var eventID = req.body.eventID;
  var select = "SELECT * FROM `pendingEvents` WHERE `eventID` = " + eventID;
  connection.query(select, function(err, rows){
    sendAcceptDeclineNotificationEmail(rows[0].ownerEmail, rows[0].eventName, "Declined");
  });
  var query = "DELETE FROM `pendingEvents` WHERE `eventID` = " + eventID;
  connection.query(query, function(err, rows){

    if(err){
      throw(err);
    }

  });

  res.send("Pending Event Successfully Deleted");

});


app.post('/viewAcceptedEvents', function(req, res) {

});


app.post('/viewPendingEvents', function(req, res) {

});


app.post('/acceptEvent', function(req, res) {

  var eventID = req.body.eventID;
  var select = "SELECT * FROM `pendingEvents` WHERE `eventID` = " + eventID;
  connection.query(select, function(err, rows){

    if(err){
      throw(err);
    }

    var insert = "INSERT INTO `acceptedEvents` (`ownerName`, `ownerEmail`, `eventName`, "
      + "`location`, `description`, `startTime`, `endTime`, `maxRegistrants`, `image`) VALUES (";

    insert += connection.escape(rows[0].ownerName) + "," + connection.escape(rows[0].ownerEmail) + "," + connection.escape(rows[0].eventName)
      + "," + connection.escape(rows[0].location) + "," + connection.escape(rows[0].description) + "," + connection.escape(rows[0].startTime)
      + "," + connection.escape(rows[0].endTime) + "," + connection.escape(rows[0].maxRegistrants) + "," + connection.escape(rows[0].image) + ")";

    connection.query(insert, function(err2, rows2) {

      if(err){
        throw(err);
      }

      sendAcceptDeclineNotificationEmail(rows[0].ownerEmail, rows[0].eventName, "Accepted");
      var query = "DELETE FROM `pendingEvents` WHERE `eventID` = " + eventID;

      connection.query(query, function(err3, rows3){

        if(err){
          throw err;
        }

      });

    });

  });

  res.send("Pending Event Successfully Accepted");

});


app.post('/addEventToPending', function(req, res) {



});


app.post('/uploadEventImage', function(req, res) {

});


function sendAcceptDeclineNotificationEmail(email, eventName, status){

  var content = "No HTML Here";
  var html_content = "";

  if(status == "Accepted"){
    html_content += "Congratulations, your event, " + eventName + ", has been approved!";
  }

  else{
    html_content += "Sorry, but your event, " + eventName + ", has been declined after being reviewed by an administrator. If you think this is a mistake, please contact your administrator and submit the event again.";
  }

  var mailOptions = {

    from: 'Zebra.mail.bot@gmail.com',
    to: email,
    subject: 'Zebra Events Portal - Status of your submitted event',
    text: content,
    html: html_content

  };

  transporter.sendMail(mailOptions, function(error, info) {

    if(error){
      console.log(error);
    }
    else{
      console.log("Message sent: " + info.response);
    }

  });


}


function sendRegistrantListNotificationEmail(email, eventName, status){


}
