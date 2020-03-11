const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

var userdatabase = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'nikhil@123',
	database : 'nodelogin'
});

userdatabase.connect(function(err){
	if(!err) {
	    console.log("Database is connected ...");
	} else {
	    console.log("Error connecting database ...");
	}
});

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

	if (username && password) {
		userdatabase.query('SELECT * FROM userdata WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/dashboard');
			} else {
				response.send('<script>alert("Incorrect Username and/or Password!");window.location="/";</script>');
			}
			response.end();
		});
	} else {
		response.send('<script>alert("Please enter Username and Password!");window.location="/";</script>');
		response.end();
	}
});

//Registration

app.post('/register', function(request, response) {
	var name = request.body.r_username;
	var email = request.body.r_email;
	var rpassword = request.body.r_password;

	userdatabase.query('INSERT INTO userdata values (?,?,?)', [name, email, rpassword], function(error, results, fields) {
		if (!error) {
			response.send('<script>alert("Registration Successful!");window.location="/";</script>');
		} else {
			response.send('<script>alert("Registration Failed!");window.location="/";</script>');
		}
	});
});

app.post('/msg', function(request, response) {
	var message = request.body.message;

	userdatabase.query('INSERT INTO messages_chat values (?,?)', [request.session.username, message], function(error, results, fields) {
		if (!error) {
			response.redirect('/chatroom');
		} else {
			response.send('<script>alert("Message not Sent!");window.location="/chatroom";</script>');
		}
	});
});

app.post('/griev', function(request, response) {
	var pur = request.body.PURPOSE;
	var adp = request.body.ADMINISTRATION_PROBLEM;
	var acdp = request.body.ACADEMIC_PROBLEM;
	var hsp = request.body.HOSTEL_PROBLEMS;
	var mp = request.body.MAINTAINANCE_PROBLEMS;
	var problem = request.body.problem;
	userdatabase.query('INSERT INTO grievance_data values (?,?,?,?,?,?,?,now())', [request.session.username, pur, adp, acdp, hsp, mp, problem], function(error, results, fields) {
		if (!error) {
			response.send('<script>alert("Grievance filed successfully!");window.location="/grievance";</script>');
		} else {
			console.log(error);
			response.send('<script>alert("Grievance not Filed!");window.location="/grievance";</script>');
		}
	});
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
			userdatabase.query('SELECT * FROM grievance_data', function(err, result) {
	        if(err){
	            console.log("Error in query;")
	        } else {
	            obj = {prob: result, name: request.session.username};
							response.render('grievance-out', obj);
	        }
	    });
		} else {
			userdatabase.query('SELECT * FROM grievance_data where purpose = ? and administration = ? and academic = ? and hostel = ? and maintainance = ?', [pur, adp, acdp, hsp, mp], function(err, result) {
	        if(err){
	            console.log("Error in query;")
	        } else {
	            obj = {prob: result, name: request.session.username};
							response.render('grievance-out', obj);
	        }
	    });
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
		userdatabase.query('SELECT * FROM messages_chat', function(err, result) {
        if(err){
            console.log("Error in query;")
        } else {
            obj = {chat: result, uname: request.session.username};
            response.render('chatroom', obj);
        }
    });
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

app.listen(3000, () => {
  console.log('Server is running at localhost:3000');
});
