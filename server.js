var express = require('express'),
	stylus = require('stylus'),
	logger = require('morgan'),
	bodyparser = require('body-parser'),
	mongoose = require('mongoose'),
	request = require("request");

var fs = require("fs");
var path = require("path");
var http = require("http");

var app = express();

app.use(bodyparser.json());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers", "Origin, X-requested-With, Content-Type, Accept");
	next();
});

//MongoDB
mongoose.Promise = global.Promise; //Geeft de error 'mongoose mpromise is deprecated' niet meer
mongoose.connect('mongodb://administrator:administrator@ds048719.mlab.com:48719/tool'); //connectie met de DB genaamd 'tool'
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
	console.log('tool db opened');
});


app.use(express.static('server/views'));


app.get("/", function(req,res){
	res.sendFile( __dirname + "/server/views/" + "navbar.html");
});

/*app.get("*", function(req,res){ //Als pagina niet bestaat waar je naar routeert, geeft hij een 404 error
	res.send("Page not found", 404);
});*/

var rooms = ""; //In deze variabele wordt 'data' van de collections 'Rooms' in opgeslagen
//var gekozenKlas = "";

app.get("/getRooms",function(req,res) {

	db.db.collection("Rooms", function(err, collection){
        collection.find({}).toArray(function(err, data){
            //console.log(data); // Het print alle rooms uit in de console die in de collection 'Rooms' staan
            rooms = data;
        })
    });

    res.json(rooms);

	console.log('rooms werden gestuurd');
	});

app.post("/form",function(req,res){ 
	if (req.body.klas == "" || req.body.leraar == "" || req.body.tittel == "" || req.body.code == "") {
		res.statusCode = 400;
		return res.send('error 400: post syntax incorrect');
	} 

	db.db.collection("Rooms", function(err, collection){
		collection.save( { //nieuwe room gegevens updaten in collection 'Rooms'
			klas : req.body.klas,
			leraar : req.body.leraar,
			tittel : req.body.tittel,
			code : req.body.code
		} )
		console.log("Room saved to db");

	});

	res.json(true); //status 'true' meegeven als room is gesaved in db

});

app.post("/questionAdd",function(req,res){

	db.db.collection('Rooms').update( //slaag gestelde vraag op
	    { klas: req.body.klasG },
	    { $set: { vraag: req.body.vraag } },
	    {upsert: true}

	);
		console.log(req.body.klasG);

		console.log("Question saved to db");
});


var port = 3000;
app.listen(port); //connectie via localhost:3000
console.log('Listening on port ' + port + ' ....');