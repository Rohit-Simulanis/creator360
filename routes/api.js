var express = require('express');
var router = express.Router();
var copydir = require('copy-dir');
var fs = require("fs-extra");
var path = require('path'); 
//var base_url = 'https://www.simulanis.in:3001/views/projects/';
var zipFolder = require('zip-folder');
// var app = require('../app'); 
const { check, validationResult } = require('express-validator');
const Bcrypt = require("bcryptjs");
const checkAuth = require("../checkAuth");
var mysql = require('../dbConfig')
var nodeMailer = require('nodemailer')
var randomstring = require("randomstring");
var dbConnection = mysql.connection
var shell = require('shelljs');
const { exec } = require("child_process");
const { command } = require('cli');
const cons = require('consolidate');

// Login Page
router.get('/',  function(req, res, next) {
	res.render('index', { title: 'NPCL' });
});

//Login Process
router.post('/loginAdmin', [
		check('email','Email can\'t be empty.').not().isEmpty(),
		check('password','Password can\'t be empty.').not().isEmpty(),
	], function(req, res, next) {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
        res.send({ "status": "failed", "msg": "Validation error", "data": errors.array() });
	}
    var email = req.body.email;
    var password = req.body.password;
	var temp=[];
    dbConnection.query('select * FROM users WHERE email= "'+email+'" and status = 1', function(err, result) {
        if (err) return;
        if(result.length==0)
        {
            res.send({ "status": "failed", "msg": "Email-id does not exists", "data": [] });
        } else { 
		    dbConnection.query('SELECT id,username,password,user_type FROM users WHERE email = ?', [email], 
		      (error, results, fields)=> {
		        if (Bcrypt.compareSync(password, results[0].password)) {
		        	req.session.login_email = email;
		        	req.session.login_id = results[0].id;
		        	req.session.login_username = results[0].username;
		        	req.session.login_user_type = results[0].user_type;
					temp.push({
						id: results[0].id,
		        		username: results[0].username,
		        		user_type: results[0].user_type,
					});
		        	if(results[0].user_type=='1')
		        	{
                        res.send({ "status": "success", "msg": "Login successfully", "data": temp });
		        	} else {
		        		var userId = results[0].id;
                        res.send({ "status": "success", "msg": "Login successfully", "data": temp });
		        	}
		        } else {
                    res.send({ "status": "failed", "msg": "Incorrect Password", "data": [] });
		        }
		    });
        }
    });    
});

router.post('/reset-password', function(req, res, next){
	var email = req.body.email;
	dbConnection.query('SELECT * FROM users where email="'+email+'"', function (err, result) {
        if(result.length!='0')
        {	
      		var randomPassword = randomstring.generate(7);
      		var password = Bcrypt.hashSync(randomPassword, 10);
      		//console.log(randomPassword);

      		// sending mail with new generated password
      		var transporter = nodeMailer.createTransport({
		      host: 'smtp.gmail.com',
		      port: 587,
		      secure: false,
		      auth: {
		          // should be replaced with real sender's account
		          user: 'harshitamaheshwari@simulanis.com',
		          pass: 'harshitamaheshwari123'
		      }
		    });

		    var mailOptions = {
				      // should be replaced with real recipient's account
				      //to: 'harshitamaheshwari@simulanis.com',
				      //subject: 'Test',												//req.body.subject
				      //body: 'Hello'													//req.body.message
				      
				      from: '"Simulanis" <no-reply@simulanis.com>', // sender address
		              to: "harshitamaheshwari@simulanis.com", // list of receivers
		              subject: "Reset Password Mail", // Subject line
		              //text: "Hello ", // plain text body
		              html: "<b>Hello "+email+", </b><br><p>Your new Password is : "+randomPassword+"<p>" // html body
		    };

		    transporter.sendMail(mailOptions, (error, info) => {
			    if (error) throw error
			        
			    dbConnection.query('update users set password=? where email=? ', [password,email],  function (err, result) {
			    	if (error) throw error
                    res.send({ "status": "success", "data": "Your new password has been sent to your email address" });

			    	// req.flash('success','Your new password has been sent to your email address.');
			    	// res.redirect('/');
			    })
			    //console.log('Message %s sent: %s', info.messageId, info.response);
			}); 
        } else {
            res.send({ "status": "failed", "data": "Email-id not registered." });
			// req.flash('error', "Email-id not registered.");
			// res.redirect('/');
        }
    
    });

	//res.render('forget-password',{title:'Forget Password'});
});


// Change Password View
router.get('/change-password', checkAuth.checkLogin, function(req,res,next){
	res.render('change-password',{title:'Change Password'});
});


// Change Password 
router.post('/update-password', checkAuth.checkLogin, function(req,res,next){
		var email = req.body.email;
		var oldPassword = req.body.oldPassword;
		var newPassword = req.body.newPassword;
		var confirmPassword = req.body.confirmPassword;
		if(newPassword==confirmPassword)
		{
			dbConnection.query('SELECT id,username,password,user_type FROM users WHERE email = ?', [email], 
			      (error, results, fields)=> {
		        if (Bcrypt.compareSync(oldPassword, results[0].password)) {
		        	dbConnection.query('update users set password=? where email=? ', [Bcrypt.hashSync(req.body.newPassword, 10), email],  function (err, result) {
				    	if (error) throw error
                        res.send({ "status": "success", "data": "Password updated successfully." });
				    })
		        } else {
                    res.send({ "status": "error", "data": "Old password not matched." });
		        }
			});
		} else {
            res.send({ "status": "error", "data": "New password and confirm password not matched." });
		}
});


router.get('/logout', checkAuth.checkLogin, function(req,res,next){
	req.session.destroy(function(err){
		if (err) throw err
        res.send({ "status": "success", "data": "Your session destroy now" });
		// res.redirect('/');
	});
});

// Project List
router.post('/projects', function(req, res, next) {
	var temp = [];
    if(req.body.login_user_type=='1')
    {
        dbConnection.query('select p.*, u.username FROM projects as p LEFT JOIN users as u on p.userId = u.id', function(err, result) {
            if (err) return;
			if(result.length != 0){
				result.map(function(list, i) {
					temp.push({
					  id: list.id,
					  username: list.username,
					  projectName: list.projectName,
					  version: list.version,
					  application_name: list.application_name,
					  created_at: new Date(list.created_at).toLocaleString()
					});
					if(result.length-1 == i)
					{
						res.send({ "status": "success", "msg": "Projects List", "data": temp });
					}	
				});	
			  }else{
					res.send({ "status": "failed", "msg": "No Data Found", "data": [] });
			  }
        });
    }  
	else if(req.body.login_user_type=='2'){
	  var id = req.body.login_id;
	  dbConnection.query('select * FROM projects WHERE userId= "'+id+'" AND status=1' , function(err, result) {
		 if (err) return;
		 if(result.length != 0){
		   result.map(function(list, i) {
			   temp.push({
				 id: list.id,
				 projectName: list.projectName,
				 version: list.version,
				 application_name: list.application_name,
				 created_at: new Date(list.created_at).toLocaleString()
			   });
			   if(result.length-1 == i)
			   {
				   res.send({ "status": "success", "msg": "Users Project List", "data": temp });
			   }	
		   });	
		 }else{
			   res.send({ "status": "failed", "msg": "No Data Found", "data": [] });
		 }
	  }); 
   }
   else {
	  res.send({ "status": "failed", "msg": "This user type not exist", "data": [] });
   }
});

// generate json 
router.post('/generateJson', function(req, res, next) {
	var projectId = req.body.projectId;
	var type = 2;
	var o = [];
	var hostpotArray = [];
	var data = [];
	var counter = 0;
	dbConnection.query('select * FROM projectviews WHERE projectId= "'+projectId+'"', function(err, result) {
			if (err) throw err
			if(result.length>0){
				result.forEach(function(view) {
					dbConnection.query('select * FROM projecthotspots WHERE viewId= "'+view.id+'"', function(hotspotserr, hotspotsresult) {
					if (hotspotserr) throw hotspotserr
					  hostpotArray = [];
					  var i=0;
					  if(hotspotsresult.length>0){
						  hotspotsresult.forEach(function(hotspot) {
							  console.log(hotspot);
							var typeValue;
							var hotspotValue='';
							var trigger;
							var defaultImg;
							switch(hotspot.hotspot_type){
							  case 1:
								typeValue = 'trigger';
								trigger = hotspot.hotspot_data.toString();
								image = '', 
								video = '', 
								text = '',
								music = '',
								defaultImg = 'hotspot.png';
								break;
							  case 2:
								typeValue = 'image';
								image = req.protocol + '://' + req.get('host')+'/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_data,
								video ='', 
								text = '',
								trigger = '',
								music = '',
								defaultImg = 'image.png';
								break;
							  case 3:
								typeValue = 'video';
								video = req.protocol + '://' + req.get('host')+'/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_data,
								image ='', 
								text = '',
								trigger = '',
								music = '',
								defaultImg = 'video.png';
								break;
							  case 4:
								typeValue = 'text';
								text = req.protocol + '://' + req.get('host')+'/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_data,
								image ='', 
								video = '',
								trigger = '',
								music = '',
								defaultImg = 'text.png';
								break;
							  case 5:
								typeValue = 'music';
								music =  req.protocol + '://' + req.get('host')+'/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_data,
								image ='', 
								video = '',
								text = '',
								trigger = '',
								defaultImg = 'music.png';
								break;
							case 5:
								typeValue = 'gif';
								music = '',
								image =	req.protocol + '://' + req.get('host')+'/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_data,
								video = '',
								text = '',
								trigger = '',
								defaultImg = 'music.png';
								break;
							}
							console.log(typeValue);
							hostpotArray[i]= {x:hotspot.x, y:hotspot.y, z:hotspot.z, icon:(hotspot.hotspot_icon!=null) ? req.protocol + '://' + req.get('host')+'/views/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_icon : '', iconType:(hotspot.hotspot_icon!=null) ? path.extname(req.protocol + '://' + req.get('host')+'/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_icon).substring(1) : '', type:typeValue, image:image, imageType:(hotspot.hotspot_data!=null) ? path.extname(image).substring(1):'',video:video, text:text, trigger:trigger};
							i++;
						  });
					  }
					  var ismuted='';
					  if(view.ismuted)
					  {
						ismuted = true;
					  } else{
						ismuted = false;
					  }
					  data = {id:view.id.toString(), background: req.protocol + '://' + req.get('host')+'/views/projects/project_id_'+projectId+'/www/asset/'+view.data, backgroundtype:(view.view_filetype == 1)? 'img': 'video', ismuted: ismuted, audio: (view.custom_audio!=null)?view.custom_audio:'', hotspot:hostpotArray}
					  counter++;
					  o.push(data);
					  if(result.length==counter)
					  {
						if (type=='2') {
						res.send({ "status": "success", "msg": "JSON data", "data": o});
						} else if(type=='1'){
						res.send({ "status": "success", "msg": "JSON data", "data": o});
						} 
					  }
					});
				})
		  }else{
			res.send({ "status": "failed", "msg": "Project not exist", "data": []});
		  }
	  });
});

// Create zip of asset
router.post('/assetZip', function(req, res, next) {
    var projectId = req.body.projectId;
	dbConnection.query('select * FROM projectviews WHERE projectId= "'+projectId+'"', function(err, result) {
		if (err) throw err
		if(result.length>0){
			zipFolder('../views/projects/project_id_'+projectId+'/www/asset/', '../views/projects/project_id_'+projectId+'/www/asset.zip', function(err) {
				if(err) {
					res.send({ "status": "failed", "msg": "Something went wrong, please try again", "path": '', "data": []});
				} else {
					res.send({ "status": "success", "msg": "Successfully done", "path": req.protocol + '://' + req.get('host')+'/views/projects/project_id_'+projectId+'/www/asset.zip', "data": []});
				}
			})
		}else{
			res.send({ "status": "failed", "msg": "Project not exist", "path": '', "data": []});
		}
	});
  });

module.exports = router;

