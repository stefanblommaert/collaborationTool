var express = require('express'),
	stylus = require('stylus'),
	logger = require('morgan'),
	bodyparser = require('body-parser'),
	mongoose = require('mongoose'),
	request = require("request"),
	cors = require('cors');

var fs = require("fs");
var path = require("path");
var http = require("http");

var app = express();

app.use(cors());
app.options('*', cors());

app.use(bodyparser.json());

app.use(function(req, res, next) { //Zou error moeten weghalen om dingen van de server te halen
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-requested-With, Content-Type, Accept, Authorization');

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

app.get("/getRooms",function(req,res) { //Rooms worden uit de database gehaald

	db.db.collection("Rooms", function(err, collection){
        collection.find({}).toArray(function(err, data){
            //console.log(data); // Het print alle rooms uit in de console die in de collection 'Rooms' staan
            rooms = data;
        })
    });

    res.json(rooms);

	console.log('rooms werden gestuurd');
});

app.get("/getClass",function(req,res) { //De juiste room aanroepen om vragen en antwoorden aan toe te voegen
	db.db.collection("stellingen", function(err, collection){
        collection.find({}).toArray(function(err, data){
            //console.log(data); // Het print alle rooms uit in de console die in de collection 'Rooms' staan
            classes = data;
            console.log(classes);
            res.json(classes);
			console.log('klassen werden gestuurd');
        })
    });    
});

//geeft vragen voor bepaalde klas weer naar script
app.post("/getQn",function(req,res) {
	console.log(req.body.klas);
	db.db.collection("stellingen", function(err, collection){
        collection.find({"klas": req.body.klas}).toArray(function(err, data){
            //console.log(data); // Het print alle rooms uit in de console die in de collection 'Rooms' staan
            classes = data;
            //console.log(classes);
            res.json(classes);
			//console.log('klassen werden gestuurd');
        })
    });    
});
//geeft de antwoorden op de gekozen vraag weer
app.post("/getAr",function(req,res) {
	//console.log(req.body.vraag + req.body.klas);
	db.db.collection("stellingen", function(err, collection){
        collection.find({"klas": req.body.klas, "vraag": req.body.vraag}).toArray(function(err, data){
            console.log(data); // Het print alle rooms uit in de console die in de collection 'Rooms' staan
            classes = data;
            //console.log(classes);
            res.json(classes);
			//console.log('klassen werden gestuurd');
        })
    });    
});

app.post("/form",function(req,res){ //Nieuwe room aan database toevoegen
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

app.post("/roomStatusToDB", function(req,res){ //Wanneer een klas wordt gestart, wordt via de script de status true meegegeven en deze wordt aangepast in de database
		db.db.collection("Rooms", function(err, collection){			
	        collection.update(
	            { klas: req.body.klas },
	            { $set: {status : req.body.statusR} },
	            { upsert: true}
	        );

	        console.log("Roomstatus saved to DB");
	    });

	res.json(true); 
})

app.post("/roomStatusFromDB", function(req,res){ //Hierin wordt in de database opgezocht welke status de gekozen room heeft en teruggestuurd naar de script
	db.db.collection("Rooms", function(err, collection){			
        collection.find({"klas": req.body.klasR}).toArray(function(err, data){
            //console.log(data);
            klassen = data;
            res.json(klassen);
        });
        
	});
})

app.post("/roomStatusStopToDB", function(req,res){ //Wanneer een klas wordt gestopt, wordt via de script de status false meegegeven en deze wordt aangepast in de database
		db.db.collection("Rooms", function(err, collection){			
	        collection.update(
	            { klas: req.body.klas },
	            { $set: {status : req.body.statusR} },
	            { upsert: true}
	        );

	        console.log("Roomstatus saved to DB (stop)");
	    });

	res.json(true); 
})


var questionAsked = false;
var questionAdded = false;
var gesteldeVraag = "";
var gesteldeVraag1 = "";
var answerAdded = false;
var answerIsAdded = false;
var gesteldAntwoord = "";
var gesteldAntwoord1 = "";


	stelling = {}
    stelling ["klas"] ="";
    stelling ["vraag"] = "";
    stelling ["antwoord"] = []; 

app.post("/addQn",function(req,res){ //Vraagstelling aan database toevoegen
	questionAdded = true;

	stelling ["klas"] = req.body.klas;
    stelling ["vraag"] = req.body.vraag;
    gesteldeVraag = req.body.vraag;

    res.json(questionAdded);
});

app.get("/isQuestionAsked", function(req,res){ //In init in de script wordt controle gevoerd of er een vraag was toegevoegd
	if (questionAdded) {
		questionAsked = true;
	}
	else{
		questionAsked = false;
	}

	res.json(questionAsked);
})

app.get("/sendQuestion", function(req,res){ //Gestelde vraag meegeven aan de script
	gesteldeVraag1 = gesteldeVraag;
	res.json(gesteldeVraag1);
})

app.post("/addAr",function(req,res){ //Antwoord op vraag aan database toevoegen
	answerAdded = true;

	stelling ["antwoord"].push(req.body.antwoord);
	gesteldAntwoord = req.body.antwoord;

	res.json(answerAdded);
});

app.get("/isAnswerAdded",function(req,res){ //In init in de script wordt controle gevoerd of er een antwoord is gegeven
	if (answerAdded) {
		answerIsAdded = true;
	}
	else{
		answerIsAdded = false;
	}

	res.json(answerIsAdded);
})

app.get("/sendAnswer", function(req,res){  //Gesteld antwoord meegeven aan de script
	gesteldAntwoord1 = gesteldAntwoord;
	res.json(gesteldAntwoord1);
})

app.post("/questionAdd",function(req,res){ //Array wordt gereset om nieuwe vraagstelling met andere antwoorden op de database te kunnen zetten
	console.log(stelling);
	db.db.collection('stellingen').save({
		klas : stelling ["klas"],
		vraag : stelling ["vraag"],
		antwoord : stelling ["antwoord"]
		}); 

		stelling ["klas"] ="";
    	stelling ["vraag"] = "";
    	stelling ["antwoord"] = [];

		console.log("Question saved to db");
		res.json(true);
});

app.get("/clearboxes", function(req,res){  //Blokken vraag en antwoord resetten
	console.log("clearboxen");
	questionAdded = false;
	answerAdded = false;
})

app.post("/register", function(req,res){ //Save nieuwe users op de database
	if (req.body.username == "" || req.body.password == "" || req.body.role == "") {
		res.statusCode = 400;
		return res.send('not everything was filled in');
	}
	if (req.body.role == "teacher" && req.body.code !== "1234") {
		res.statusCode = 400;
		return res.send('please give the correct teacherCode');
	}
	db.db.collection("Users", function(err, collection){
		collection.save( { //nieuwe room gegevens updaten in collection 'users'
			username : req.body.username,
			password : req.body.password,
			role : req.body.role
		} )
		console.log("user saved to db");

	});

	res.json(true); //status 'true' meegeven als room is gesaved in db
});

app.post("/checkRoles", function(req,res){
	if (req.body.username == "" || req.body.password == "") {
		res.statusCode = 400;
		return res.send('not everything was filled in');
	}
	db.db.collection("Users", function(err, collection){
		console.log('username = ' + req.body.username);
		console.log('password = ' + req.body.password);
        collection.find({"username": req.body.username, "password": req.body.password}).toArray(function(err, data){
			user = data;
			if (user == null) {
				res.statusCode = 400;
				return res.send('no role was appended to this usernam');
			}
			else {
				//console.log('user' + data +' met ' + req.body.username +'en' + req.body.password ); // Het print alle rooms uit in de console die in de collection 'Rooms' staan
	            user = data;
	            //console.log(classes);
	            res.json(user);
				console.log(user);
			}
        })
    }); 
})

var myDocument = "";
var myPassword = "";

app.post("/authenticate",function(req,res){ //Controle login gegevens met de database 'Users'
	db.db.collection("Users", function(err, collection){
		//console.log(req.body.username);
        myDocument = collection.findOne({"username": req.body.username});

        if (myDocument) {
			myDocument.then(function(result){
				console.log(result.password);
				myPassword = result.password;

				
				if (req.body.password !== myPassword) { //user role moet hier nog bijkomen
					console.log('400');
					res.json({
						success: false,
						message: "Login failed"
					});
					res.statusCode = 400;
					return res.send('error 400: post syntax incorrect');
				} 
				else {
					console.log('200');
					res.statusCode = 200;
					res.json({
						success: true,
						message: "Login succeeded"
					});
					console.log(myPassword);
				}
					
			})
        
        }
    });

	
});
var port = 3000;
app.listen(port); //connectie via localhost:3000
console.log('Listening on port ' + port + ' ....');