const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const { Connection, Request } = require("tedious");
var TYPES = require('tedious').TYPES;

var port = process.env.PORT || 3000;

const config = {
	authentication: {
		options: {
			userName: "server-admin-login",
			password: "nikhil@123"
		},
		type: "default"
	},
	server: "scams.database.windows.net",
	options: {
		database: "scams-database",
		encrypt: true
	}
};

const connection = new Connection(config);
  
connection.on("connect", err => {
	if (err) {
		console.error(err.message);
		console.log(err);
	} else {
		console.log("Connected...");
	}
});

var _currentData = {};

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// Set the default views directory to html folder
app.set('views', path.join(__dirname, 'html'));

// Set the folder for css & java scripts
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/', routes);

//Login

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var results = [];

	if (username && password) {
		const req = new Request(`SELECT * FROM userdata WHERE username=@username AND password=@password`, (err) => {
			if (err) { console.error(err.message);}});
		req.addParameter('username', TYPES.VarChar, username);
		req.addParameter('password', TYPES.VarChar, password);
		req.on('row', function(columns) {
			let val = {}
			columns.forEach(function(column) {
			  val[column.metadata.colName] = column.value;
			});
			results.push(val);
		});
		req.on('requestCompleted', function() { 
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/dashboard');
			} else {
				response.send('<script>alert("Incorrect Username and/or Password!");window.location="/";</script>');
			}
			response.end();
		});
		connection.execSql(req);
	}
});

//Registration

app.post('/register', function(request, response) {
	var name = request.body.r_username;
	var email = request.body.r_email;
	var rpassword = request.body.r_password;

	const req = new Request(`INSERT INTO userdata values (@name,@email,@rpassword)`, (err) => {
		if (err) {
			response.send('<script>alert("Registration Failed!");window.location="/";</script>');
		}
		else {
			response.send('<script>alert("Registration Successful!");window.location="/";</script>');
		}
	});
	req.addParameter('name', TYPES.VarChar, name);
	req.addParameter('email', TYPES.VarChar, email);
	req.addParameter('rpassword', TYPES.VarChar, rpassword);
	connection.execSql(req);
});

app.post('/msg', function(request, response) {
	var message = request.body.message;

	const req = new Request(`INSERT INTO messages_chat values (@username,@message)`, (err) => {
		if (err) {
			response.send('<script>alert("Message not Sent!");window.location="/chatroom";</script>');
		}
		else {
			response.redirect('/chatroom');
		}
	});
	req.addParameter('username', TYPES.VarChar, request.session.username);
	req.addParameter('message', TYPES.VarChar, message);
	connection.execSql(req);
});

app.post('/griev', function(request, response) {
	var pur = request.body.PURPOSE;
	var adp = request.body.ADMINISTRATION_PROBLEM;
	var acdp = request.body.ACADEMIC_PROBLEM;
	var hsp = request.body.HOSTEL_PROBLEMS;
	var mp = request.body.MAINTAINANCE_PROBLEMS;
	var problem = request.body.problem;

	const req = new Request(`INSERT INTO grievance_data values (@username,@pur,@adp,@acdp,@hsp,@mp,@problem,now())`, (err) => {
		if (err) {
			console.log(error);
			response.send('<script>alert("Grievance not Filed!");window.location="/grievance";</script>');
		}
		else {
			response.send('<script>alert("Grievance filed successfully!");window.location="/grievance";</script>');
		}
	});
	req.addParameter('username', TYPES.VarChar, request.session.username);
	req.addParameter('pur', TYPES.VarChar, pur);
	req.addParameter('adp', TYPES.VarChar, adp);
	req.addParameter('acdp', TYPES.VarChar, acdp);
	req.addParameter('hsp', TYPES.VarChar, hsp);
	req.addParameter('mp', TYPES.VarChar, mp);
	req.addParameter('problem', TYPES.VarChar, problem);
	connection.execSql(req);
});

app.post('/grievancedisplay', function(request, response) {
	if (request.session.loggedin) {
		var obj = {};
		var pur = request.body.PURPOSE;
		var adp = request.body.ADMINISTRATION_PROBLEM;
		var acdp = request.body.ACADEMIC_PROBLEM;
		var hsp = request.body.HOSTEL_PROBLEMS;
		var mp = request.body.MAINTAINANCE_PROBLEMS;
		if (pur === 'all') {
			var results = [];

			const req = new Request(`SELECT * FROM grievance_data`, (err) => {
				if (err) { console.error(err.message);}});
				
			req.on('row', function(columns) {
				let val = {}
				columns.forEach(function(column) {
				val[column.metadata.colName] = column.value;
				});
				results.push(val);
			});
			req.on('requestCompleted', function() {
				obj = {prob: results, name: request.session.username};
				response.render('grievance-out', obj);
			});
			connection.execSql(req);
		} else {
			var results = [];

			const req = new Request(`SELECT * FROM grievance_data where purpose=@pur and administration=@adp and academic=@acdp and hostel=@hsp and maintainance=@mp`, (err) => {
				if (err) { console.error(err.message);}});
			req.addParameter('pur', TYPES.VarChar, pur);
			req.addParameter('adp', TYPES.VarChar, adp);
			req.addParameter('acdp', TYPES.VarChar, acdp);
			req.addParameter('hsp', TYPES.VarChar, hsp);
			req.addParameter('mp', TYPES.VarChar, mp);
				
			req.on('row', function(columns) {
				let val = {}
				columns.forEach(function(column) {
				val[column.metadata.colName] = column.value;
				});
				results.push(val);
			});
			req.on('requestCompleted', function() {
				obj = {prob: results, name: request.session.username};
				response.render('grievance-out', obj);
			});
			connection.execSql(req);
		}
	}
	else {
		response.send('<script>alert("Please login to view this page!");window.location="/";</script>');
	}
});

app.post('/out', function(request, response) {
	request.session.loggedin = false;
	response.redirect('/');
});

//Pages

app.get('/chatroom', function(request, response) {
	if (request.session.loggedin) {
		var obj = {};
		var results = [];

		const req = new Request(`SELECT * FROM messages_chat`, (err) => {
			if (err) { console.error(err.message);}});
			
		req.on('row', function(columns) {
			let val = {}
			columns.forEach(function(column) {
			  val[column.metadata.colName] = column.value;
			});
			results.push(val);
		});
		req.on('requestCompleted', function() {
			obj = {chat: results, uname: request.session.username};
			response.render('chatroom', obj);
		});
		connection.execSql(req);
	}
	else {
		response.send('<script>alert("Please login to view this page!");window.location="/";</script>');
	}
});

app.get('/grievance', function(request, response) {
	if (request.session.loggedin) {
		var obj = {name: request.session.username};
		response.render('grievance', obj);
	}
	else {
		response.send('<script>alert("Please login to submit grievance!");window.location="/";</script>');
	}
});

app.get('/grievancefind', function(request, response) {
	var obj = {name: request.session.username};
	response.render('grievance-find', obj);
});

app.get('/dashboard', function(request, response) {
	if (request.session.loggedin) {
		var obj = {name: request.session.username};
		response.render('dashboard', obj);
	}
	else {
		response.send('<script>alert("Please login to view dashboard!");window.location="/";</script>');
	}
});

app.listen(port, () => {
  console.log(	'Server is running at localhost: '+ port);
});
