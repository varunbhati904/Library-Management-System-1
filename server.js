var express=require('express'),
app=express(),
ejs=require('ejs'),
mongoose=require('mongoose'),
passport=require('passport'),
bodyParser = require('body-parser'),
expressSessions = require('express-sessions'),
LocalStrategy=require('passport-local');

mongoose.connect('mongodb+srv://test:test@cluster0.lq9vw.mongodb.net/libmngmtsys?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology:true});
var db=mongoose.connection;
db.on('open',function(err){
	console.log("connected to db");
});


User=require('./models/user');
Book=require('./models/book');
Issue=require('./models/issue');

app.use(require('express-session')({
    secret: "sih2021",
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
var date = new Date(8/8/2020);
var h = date.getHours();
var m = date.getMinutes();
var s = date.getSeconds();
app.get('/',function(req,res){
	res.render('index',{req});
});

app.get('/login',function(req,res){
	res.render('login',{req});
});


app.get('/register',function(req,res){
	res.render("register",{req});
});

app.get('/issue',function(req,res){
	if (req.isAuthenticated()) {
		res.render('issue',{req});
	}else {
		res.redirect("/login");
	}

});
app.get("/dashboard",function(req,res){
	if (req.isAuthenticated()) {
		if(req.user.role === "Admin")
		res.render("adminDashboard");
		else {
			res.render("dashboard",{req});
		}
	}else{
		res.redirect("/login");
	}
})

app.post('/register',function(req,res){
	try{
		var confirmed= false;
		if(req.user && req.user.role === 'Admin')
			confirmed = true;
		User.register(new User({'name':req.body.name,'confirmed':confirmed,'username':req.body.username,'email':req.body.email,'DOB':req.body.DOB,'rollno':req.body.rollno, 'role':req.body.role, 'expiry':req.body.expiry}),req.body.password,function(err){
			if(err){
				res.send("Opps Something Went Wrong")
				console.log(err);
			}

			else{
				passport.authenticate("local")(req,res,function()
				{
					console.log('registered');
					res.render('thankyou',{req, msg:"User Registered"});
				});
		}}
		);
	}catch(err){
		res.status(500).send(err.name);
	}
});

app.post('/csv_register', function(req, res){
	if(req.body.code === 'lkshdfiohnaklsdnka'){
		User.register(new User({'name':req.body.name,'confirmed':true,'username':req.body.username,'email':req.body.email,'DOB':req.body.DOB,'rollno':req.body.rollno, 'role':req.body.role}),req.body.password,function(err){
			if(err){
				res.status(500).send("Opps Something Went Wrong")
				console.log(err);
			}

			else{
				passport.authenticate("local")(req,res,function()
				{
					console.log('registered');
					res.send('thankyou');
				});
		}}
		);
	}
	else {
		res.status(401).send('unauthorized');
	}
})

app.get("/edit_profile", function(req, res){
	if(req.isAuthenticated()){
		if(req.user.confirmed === true)
		res.render("edit_profile",{user:req.user,req})
		else {
			res.status(401).send("Your Status is not confirmed")
		}
	}
	else {
		res.redirect("/login");
	}
});

app.post("/edit_profile",(req, res) =>{
	const rollno = req.body.rollno;
	const email = req.body.email;
	const name = req.body.name;
	if(req.user.confirmed === true){
		User.update({username:req.user.username},{$set:{rollno:rollno,email:email,name:name}},(err)=>{
			if(err)
			res.status(500).send(err);
			else {
				res.render("thankyou",{msg:"Profile Edited"});
			}
		})
	}
})

app.get('/edit_book_accno', function(req, res){
	if(req.isAuthenticated()){
		if(req.user.role === "Admin")
		res.render("edit_book_accno",{req});
		else {
			res.status(401).send();
		}
	}
	else {
		res.status(401).send()
	}
})

app.post("/edit_book_accno", function(req, res){
	accno = req.body.accno;
	if(req.isAuthenticated()){
		if(req.user.role === "Admin"){
			Book.findOne({AccNo:accno},(err,book)=>{
				if(err)
				res.status(500).send(err)
				else {
				res.render("edit_book",{book:book,req})
				}
			})
		}
		else {
			res.status(401).send("You are not Admin");
		}
	}
	else {
		res.redirect("/login");
	}
});

app.post("/edit_book",(req, res) =>{
	const author = req.body.author;
	const shelfNo = req.body.shelfno;
	const name = req.body.name;
	if(req.user.role === 'Admin'){
		Book.update({AccNo:req.body.accno},{$set:{ShelfNo:shelfNo,author:author,name:name}},(err)=>{
			if(err)
			res.status(500).send(err);
			else {

				res.render("thankyou",{msg:"Book Edited"});
			}
		})
	}
	else
		res.status(401).send()
})

app.get("/all_users",function(req,res){
	if(req.isAuthenticated()){
		if(req.user.role === "Admin"){
			User.find({},function(err,users){
				if(!err)
				res.render("users",{found:users});
				else
				res.send("err occured");
		});
		}
		else {
			res.send("You are Not Admin")
		}
	}
	else {
		res.redirect("/login")
	}
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
			if(req.user.confirmed === true)
		  res.redirect("/dashboard");
			else {
				res.send("You are not confirmed by admin");
			}
			console.log(req.user);
		});
	  }
	});
  });

app.get('/request',function(req,res){
	if(req.isAuthenticated()){
		User.find({confirmed:false}, function(err, user){
			if(err)
			console.log(err);
			else if (!user) {
				res.send("None User without confirmed status!")
			}
			else {
				res.render("request",{users:user});
			}
		})
	}
})

app.post("/request", function(req,res){
	const checkb = req.body.checkb;
	User.findOneAndUpdate({username:checkb},{$set:{confirmed:true}}, function(err, user){
		if(err)
		console.log(err);
		else if(!user)
		res.send("No user find");
		else
		res.redirect("/dashboard")
	})
})

	app.get('/deleteUser', function(req,res){
		if(req.isAuthenticated()&&req.user.role=="Admin"){
			res.render("delete",{req});
		}
		else {
			res.redirect("/login");
		}
	})
	
	app.get('/circulation', function(req,res){
		if(req.isAuthenticated()&&req.user.role=="Admin"){
			res.render("circulation",{req});
		}
		else {
			res.redirect("/login");
		}
	})
	
	app.get('/administration', function(req,res){
		if(req.isAuthenticated()&&req.user.role=="Admin"){
			res.render("administration",{req});
		}
		else {
			res.redirect("/login");
		}
	})

app.post('/deleteUser', function(req,res){
	const username = req.body.username;
	User.deleteOne({username: username}, function(err){
		if(err)
		console.log(err);
		else {
			res.send("Deleted Successfully!");
		}
	})
})

  app.get("/profile",function(req,res){
	  if(req.isAuthenticated()){
		  const user = req.user;
		  console.log(user);
		res.render("profile",{user:user,req});

	  }else{
		  res.redirect("/login")
	  }

  });
	app.get('/logout',function(req,res){
	    req.session.destroy(function(err){
	        if(err){
	            console.log(err);
	        }
	        else
	        {
	            res.redirect('/');
	        }
	    });

	});
	app.get("/issued",function(req,res){
		if(req.isAuthenticated()){
			const user = req.user.username;
			Issue.find({username: user},function(err,books){
				if(err){
					console.log(err);
				}else{
					if(books){
						res.render('issued',{found:books,req});
					}
				}
			})
		}
	})


app.post("/issue",function(req,res){
	var newissue = new Issue({
		AccNo: req.body.accno,
		username: req.user.username
	});

	if(!req.user||(!req.body.accno)){
	return res.status(401).send("unauthorized")
	}

	Book.findOne({AccNo:req.body.accno},function(err,re){
	if((!re)||re.Status=="Issued")
	return res.status(401).send("Alredy Issued");
	});
	Book.findOneAndUpdate({AccNo:req.body.accno},{Status:"Issued"},function(err){
		if(err){
			console.log(err);
			res.status(400).send({err:err});
		}
		else if(book.Status=="Issued")
		res.status(401).send("already issued");
	else{
	newissue.save(function(err){
		if(err){
			console.log(err);
			res.status(400).send({err:err});
		}
		else if(!book)
		res.status(404).send("No such book Found");
		else{
			if(book.Status=="Available")
			res.status(200).send({status:"issued",book:book});
			else
			res.status(401).send("already issued");
		}
	});
	}


	})
});

app.post("/issueapi",function(req,res){
	console.log(req.body,req.accno);
	var name;

	Book.findOne({AccNo:req.body.accno} ,function(err,re){
		name=re.name

	var newissue = new Issue({
		AccNo: req.body.accno,
		username: req.user.username,
		name:name
	})


	if(!req.user||(!req.body.accno)){
	return res.status(401).send("unauthorized")
	}

	Book.findOneAndUpdate({AccNo:req.body.accno},{Status:"Issued"},function(err,book){
		if(err){
			console.log(err);
		}

		else if(book.Status=="Issued")
		res.status(401).send("already issued");
	else{
	newissue.save(function(err){
		if(err){
			console.log(err);
			res.status(400).send({err:err});
		}
		else if(!book)
		res.status(404).send("No such book Found");
		else{
			if(book.Status=="Available")
			res.status(200).send({status:"issued",book:book});
			else
			res.status(401).send("already issued");
		}
	});
	}

	})
	});




});

app.get("/book",function(req,res){
	res.render("book",{req});
});

app.post("/book",function(req,res){
	var newbook = new Book({
		name :req.body.name,
		author :req.body.author,
		ISBN : req.body.ISBN,
		ShelfNo : req.body.ShelfNo,
		AccNo : req.body.AccNo,
		publisher : req.body.publisher,
		category : req.body.category,
		bibliographical_entry: req.body.be
	});
	newbook.save(function(err){
		if(err){
			console.log(err);
		}else{
			res.render("thankyou",{req});
		}
	})
});
app.get("/search",function(req,res){
	res.render("search",{req});
});
app.post("/search",function(req,res){
	const book = req.body.bname;
	const author = req.body.aname;
	if(!book){
		if(!author){
			Book.find({},function(err,found){
				if(err){
					console.log(err);
				}else{
					if(found){
						res.render('find',{found:found,req})
					}else{
						res.send("No book found");
					}
				}
			})
		}else{
			Book.find({author:new RegExp(author,'i') },function(err,found){
				if(err){
					console.log(err);
				}else{
					if(found){
						res.render('find',{found:found,req})
					}else{
						res.send("No book found");
					}
				}
			})
		}

	}else if (!author) {
		Book.find({name:new RegExp(book,'i')},function(err,found){
			if(err){
				console.log(err);
			}else{
				if(found){
					res.render('find',{found:found,req})
				}else{
					res.send("No book found");
				}
			}
		})
	}
		else{
		Book.find({name:new RegExp(book,'i'),author:new RegExp(author,'i')},function(err,found){
			if(err){
				console.log(err);
			}else{
				if(found){
					res.render('find',{found:found,req})
				}else{
					res.send("No book found");
				}
			}
		})
	}
})

app.get("/deposit",function(req,res){
	res.render("deposit",{req});
});

app.post("/deposit",function(req,res){
	const d = req.body.accno;
     Issue.deleteOne({AccNo: d},function(err){
		 if(err){
			 console.log(err);
			res.status(400).send({err:err});
		 }else{

			 Book.findOneAndUpdate({AccNo:d},{Status:"Available",IssuedTo:" "},function(err,found){
				 console.log("ok");
				 if(err){
					 console.log(err);
				 }
				 console.log(found);
				res.send(found);
			 })

		 }
	 });
});

app.get("/updatefine", function(req, res){
	if(req.isAuthenticated()){
		if(req.user.role === "Admin"){
			Fine.find({},function(err, found){
				if(err)
				res.status(500).send(err);
				else if(!found)
				res.status(404).send("Not Found")
				else {
					res.render("update_fine_edit",{data:found[0]})
				}
			})
		}
	}
})

app.post("/updatefine",async function(req, res){
	fine = req.body.fine;
	if(req.isAuthenticated()){
		if(req.user.role === "Admin"){
			const updateFine = await Fine.update({},{$set:{fine:fine}});
			if(!updateFine)
			res.status(404).send("Not Updated");
			Issue.find({},function(err,found){
				if(err){
					console.log(err);
					res.status(500).send()
				}else{
					if(found){
						console.log(found);
						for(var i=0;i<found.length;i++){
							if(found[i].Due_on > date){
								User.findOneAndUpdate({username:found[i].username},{$inc:{Fine: fine}},function(err,user){
									if(err){
										console.log(err);
										res.status(500).send()
									}else{

											console.log(user);
								}
							})
						}
					}
					res.render("thankyou",{msg:"Fine Updated"});
				}
				else
					res.render("thankyou",{msg:"Updated"});
			}})
		}
		else
		res.status(401).send();
	}
	else
		res.status(401).send();

})

app.listen(process.env.PORT||2000,function(err){
	if(err)
		console.log(err);
	else
		console.log("Serving on port 2000",process.env.PORT);
});
