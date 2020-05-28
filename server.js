var express=require('express'),
app=express(),
ejs=require('ejs'),
mongoose=require('mongoose'),
passport=require('passport'),
bodyParser = require('body-parser'),
expressSessions = require('express-sessions'),
LocalStrategy=require('passport-local');

mongoose.connect('mongodb://localhost:27017/sih2020',{useNewUrlParser: true, useUnifiedTopology:true});
var db=mongoose.connection;
db.on('open',function(err){
	console.log("connected to db");
});


User=require('./models/user');
Book=require('./models/book');
Issue=require('./models/issue');

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


app.post("/login",function(req,res){
	const user = new User({
	  username:req.body.username,
	  password:req.body.password
	});
	req.login(user, function(err){
	  if(err){
		console.log(err);
		res.redirect("/login");
	  } else {
		passport.authenticate("local") (req,res,function(){
		  res.redirect("/");
		});
	  }
	});
  });

app.post("/issue",function(req,res){
	var newissue = new Issue({
		accno: req.body.accno,
		username: req.body.username
	});
	newissue.save(function(err){
		if(err){
			console.log(err);
		}else{
			res.redirect("/");
		}
	});
});

app.get("/book",function(req,res){
	res.render("book");
});

app.post("/book",function(req,res){
	var newbook = new Book({
		name :req.body.name,
		author :req.body.author,
		ISBN : req.body.ISBN,
		ShelfNo : req.body.ShelfNo,
		AccNo : req.body.AccNo,
		publisher : req.body.publisher,
		category : req.body.category
	});
	newbook.save(function(err){
		if(err){
			console.log(err);
		}else{
			res.redirect("/");
		}
	})
});

app.get("/search",function(req,res){
	res.render("search");
});
app.get("/bookname",function(req,res){
	res.render("bookn");
});

app.post("/bookname",function(req,res){
	const name = req.body.name;
	Book.find({name: name},function(err,found){
		if(err){
			res.send(err);
		}else{
			if(found){
				res.send(found);
			}else{
				res.end("Not Found");
			}
		}
	})
})
app.get("/authorname",function(req,res){
	res.render("authorn");
});

app.post("/authorname",function(req,res){
	const name = req.body.name;
	Book.find({author: name},function(err,found){
		if(err){
			res.send(err);
		}else{
			if(found){
				res.send(found);
			}else{
				res.end("Not Found");
			}
		}
	})
})
app.get("/bookauthor",function(req,res){
	res.render("bookauthor");
});

app.post("/bookauthor",function(req,res){
	const name = req.body.bname;
	const author = req.body.aname;
	Book.find({name: name, author: author},function(err,found){
		if(err){
			res.send(err);
		}else{
			if(found){
				res.send(found);
			}else{
				res.end("Not Found");
			}
		}
	})
})

app.get("/deposit",function(req,res){
	res.render("deposit");
});

app.post("/deposit",function(req,res){
	const d = req.body.accno;
     Issue.deleteOne({AccNo: d},function(err){
		 if(err){
			 console.log(err);
		 }else{
			 res.send("Deposit Succesfully");
		 }
	 })
})


app.listen(2000,function(err){
	if(err)
		console.log(err);
	else
		console.log("Serving on port 2000");
});