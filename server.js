var express = require('express'),
	stylus = require('stylus'),
	logger = require('morgan'),
	bodyparser = require('body-parser'),
	mongoose = require('mongoose'),
	request = require("request");
var app = express();

app.use(bodyparser.json());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers", "Origin, X-requested-With, Content-Type, Accept");
	next();
});

//MongoDB
mongoose.Promise = global.Promise; //Geeft de error 'mongoose mpromise is deprecated' niet meer
mongoose.connect('mongodb://localhost/tool'); //connectie met de DB genaamd 'tool'
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
	console.log('tool db opened');
});

var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);
var mongoMessage = Message.findOne().exec(function(err, messageDoc) {
	mongoMessage = messageDoc.message;
});


var path = require("path");
app.use(express.static('server/views'));

app.get("/", function(req,res){
	res.sendFile( __dirname + "/server/views/" + "navbar.html");
	mongoMessage: mongoMessage
});


var rooms = [
	{ klas : 'test1', leraar : 'test1', tittel : 'test1', code : 'test1'},
	{ klas : 'test2', leraar : 'test2', tittel : 'test2', code : 'test2'}
];

app.get("/getRooms",function(req,res) {
	res.json(rooms);
	console.log('rooms werden gestuurd');
	});

app.post("/form",function(req,res){ 
	if (req.body.klas == "" || req.body.leraar == "" || req.body.tittel == "" || req.body.code == "") {
		res.statusCode = 400;
		return res.send('error 400: post syntax incorrect');
	} 
		
	var newRoom = {
	klas : req.body.klas,
	leraar : req.body.leraar,
	tittel : req.body.tittel,
	code : req.body.code
	};

	rooms.push(newRoom);
	console.log("received booking");
	console.log(rooms);
	res.json(true);

	var stringRooms = JSON.stringify(rooms);

	fs = require('fs');
	fs.writeFile('rooms.txt', stringRooms, function (err) {
  	if (err) return console.log(err);
  	console.log('rooms werd opgeslagen');
	});
});


var port = 3000;
app.listen(port); //connectie via localhost:3000
console.log('Listening on port ' + port + ' ....');