var express = require('express'),
	stylus = require('stylus'),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'; 

var app = express();
 
function compile(str, path){
	return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.use(express.static('server/views'));

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

app.get('/', function(req, res){
	res.render('navbar.html', { //algemene html pagina ophalen om in te routeren
		mongoMessage: mongoMessage
	}); 
})


var port = 3000;
app.listen(port); //connectie via localhost:3000
console.log('Listening on port ' + port + ' ....');