var express = require('express'),
	stylus = require('stylus'),
	logger = require('morgan'),
	bodyParser = require('body-parser');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'; 

var app = express();
 
function compile(str, path){
	return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.use(express.static('server/views'));

app.get('/', function(req, res){
	res.render('navbar.html');
})


var port = 3030;
app.listen(port);
console.log('Listening on port ' + port + ' ....');