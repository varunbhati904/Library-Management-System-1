var express=require('express'),
app=express(),
ejs=require('ejs'),
mongoose=require('mongoose'),
passport=require('passport'),
bodyParser = require('body-parser'),
expressSessions = require('express-sessions'),
LocalStrategy=require('passport-local');

mongoose.connect('mongodb://localhost:27017/sih2020');
var db=mongoose.connection;
db.on('open',function(err){
	console.log("connected to db");
});


User=require('./models/user');
Book=require('./models/book');

app.use(require('express-session')({
    secret: "sih2020",
    resave: false,
    saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',function(req,res){
	res.render('index');
});

app.get('/login',function(req,res){
	res.render('login');
});


app.get('/register',function(req,res){
	res.render('register');
});

app.get('/issue',function(req,res){
	res.render('issue');
});

app.post('/register',function(req,res){
	User.register(new User({'name':req.body.name,'username':req.body.username,'Email':req.body.email,'DOB':req.body.DOB,'rollnumber':req.body.rollnumber}),req.body.password,function(err){
		if(err)
			console.log(err);
		else{
			passport.authenticate("local")(req,res,function()
			{
				console.log('registered');
				res.render('thankyou');
			});
	}}
	);
});


app.post('/login',passport.authenticate("local",{failureRedirect:'/login'}),function(req,res)	{
				res.render('index');
});


app.listen(3000,function(err){
	if(err)
		console.log(err);
	else
		console.log("Serving on port 3000");
});