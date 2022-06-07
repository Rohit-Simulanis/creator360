var express = require('express');
var router = express.Router();
var copydir = require('copy-dir');
var fs = require("fs-extra");
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
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
// var sendEmail = require('../emailManager');
const cons = require('consolidate');

// Login Page
router.get('/', function (req, res, next) {
	//console.log(checkAuth.checkLogin);
	res.render('index', { title: 'NPCL' });
});

// Test Page
router.get('/test', function (req, res, next) {
	// console.log('Hello')

	ffmpeg.setFfmpegPath(ffmpegPath)

	ffmpeg('video.mp4')
		.setStartTime('00:00:15')
		.setDuration('10')
		.output('video_out.mp4')
		.on('end', function (err) {
			if (!err) { console.log('conversion Done') }
		})
		.on('error', function (err) {
			console.log('error: ', err)
		}).run()

});

// router.get('/test', function(req, res, next) {


// 	exec("cordova create project_id_1", (error, stdout, stderr) => {

//         if (error) {
//             console.log(error);
//             return;
//         }
//         if (stderr) {
//             console.log(stderr);
//             return;
//         }
//         console.log(stdout);

//     });

// });


//Login Process
router.post('/loginAdmin', [
	check('email', 'Email can\'t be empty.').not().isEmpty(),
	check('password', 'Password can\'t be empty.').not().isEmpty(),
], function (req, res, next) {
	debugger;
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		req.flash('validationError', errors.array());
		res.redirect('/');
	}
	var email = req.body.email;
	var password = req.body.password;
	dbConnection.query('select * FROM users WHERE email= "' + email + '"', function (err, result) {
		if (err) throw err
		if (result.length == 0) {
			req.flash('error', "Email-id does not exists.");
			return res.redirect('/');
		} else {
			dbConnection.query('SELECT * FROM users WHERE email= "' + email + '" and status = 1', (error, results, fields) => {
				if (results.length == 0) {
					dbConnection.query('SELECT * FROM questions_list', (err, Questions) => {
						// console.log(this.sql);
						if (err) throw err 
						if (Questions.length == 0) {
							req.flash('error', "Your screen is locked. Please answer these questions to unlock the screen");
							res.render('user_answer', { title: 'Submit you answer', userId: result[0].id });
						} else {
							// console.log(Questions);
							req.flash('error', "Your screen is locked. Please answer these questions to unlock the screen");
							res.render('user_answer', { title: 'Submit you answer', data: Questions, userId: result[0].id });
						}
					});

				}
				else {
					//start
					// console.log(password);
					// console.log("results[0].password");
					// console.log(results);
					if (Bcrypt.compareSync(password, results[0].password)) {
						req.session.login_email = email; 
						req.session.login_id = results[0].id;
						req.session.login_username = results[0].username;
						req.session.login_user_type = results[0].user_type;
						req.session.login_image = results[0].image;
						req.session.login_license_id = results[0].license_id;
						if (results[0].user_type == '1') {
							dbConnection.query('update users set wrong_attemp=? where email=? ', [0, email], function (err, result) {
								if (error) throw error
								req.flash('success', "You are successfully logged in.");
								res.redirect('/dashboard');
							})
						} else {
							var now = new Date();
							var created_Date = new Date(results[0].created_at);
							var expiry_Date = new Date(created_Date.getTime() + (90 * 24 * 60 * 60 * 1000));
							var Difference_In_createdDate_CurrentDate = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(created_Date.getFullYear(), created_Date.getMonth(), created_Date.getDate())) / (1000 * 60 * 60 * 24));
							// console.log(Difference_In_createdDate_CurrentDate);
							// console.log(new Date(created_Date).toDateString());
							// console.log(new Date(expiry_Date).toDateString());
							if (Difference_In_createdDate_CurrentDate >= 90) {
								dbConnection.query('update users set status=0 where id ="' + results[0].id + '"', (err, result2) => {
									if(err) return; 
									dbConnection.query('SELECT * FROM questions_list', (err, Questions) => {
                						// console.log(this.sql);
                						if (err) throw err
                						if (Questions.length == 0) {
                							req.flash('error', "Your screen is locked. Please answer these questions to unlock the screen");
                							res.render('user_answer', { title: 'Submit you answer', userId: result[0].id });
                						} else {
                							// console.log(Questions);
                							req.flash('error', "Your screen is locked. Please answer these questions to unlock the screen");
                							res.render('user_answer', { title: 'Submit you answer', data: Questions, userId: result[0].id });
                						}
                					});
								//	req.flash('error', "Your password is expired now, Please answer these questions or use forget password.");
								//	res.render('user_answer', { title: 'Submit you answer', userId: result[0].id });
								});
							}
							else if (Difference_In_createdDate_CurrentDate >= 75) {
								dbConnection.query('SELECT * FROM questions_list', (err, Questions) => {
									// console.log(this.sql);
									if (err) throw err
									req.flash('error', "Your password will expire after some days, please update it.");
									res.render('change-password', { title: 'Change Password', data: Questions });
								});
							}
							else {
								dbConnection.query('update users set wrong_attemp=? where email=? ', [0, email], function (err, result) {
									if (error) console.log(error);
									console.log("error");
							
									var data = { user_id: results[0].id }
									dbConnection.query('INSERT INTO login_history SET ?', data, function (err, result) {
										if (err) throw err
										req.flash('success', "You are successfully logged in.");
										res.redirect('/projects');
									});

								})
							}
						}

					} else { 
						var count = results[0].wrong_attemp + 1;
						if (count >= 5) {
							dbConnection.query('update users set wrong_attemp=?, status=? where email=? ', [count, 0, email], function (err, result) {
								if (error) return;
								req.flash('error', "Incorrect Password.");
								res.redirect('/');
							})
						} else {
							dbConnection.query('update users set wrong_attemp=? where email=? ', [count, email], function (err, result) {
								if (error) return;
								req.flash('error', "Incorrect Password.");
								res.redirect('/');
							})
						}
					}
					//end
				}
			});
		}
	});

});


router.post('/web-view', function (req, res, next) {
	var webview = req.body.webview;
	// console.log(webview);
	dbConnection.query('SELECT * FROM projectinventory WHERE id =' + webview, function (err, result) {
		if (err) throw err
		//console.log(result);
		res.render('web-view', { title: 'Web View', data: result });
	});
});

router.post('/copy-directory', function (req, res, next) {
	var webview = req.body.webview1;
	// console.log(webview); 
	/*/	var dirnew = fs.mkdir('/public/uploads', { recursive: true }, (err) => {
			if (err) throw err;
		});
		fs.copy('public/WebView', 'public/uploads/shivangi'+webview+'/', function (err) {
			if (err){
				console.log('An error occured while copying the folder.')
				return console.error(err)
			}
			console.log('Copy completed!')
		});
		*/
	res.redirect("http://simulanis.co.in/NPCLTEST/public/uploads/imageWebview/");
	//res.render('branding',{title:'copy-directory'});
});

router.get('/branding', checkAuth.checkLogin, function (req, res, next) {
	res.render('branding', { title: 'Branding' });
});


router.get('/play', checkAuth.checkLogin, function (req, res, next) {
	res.render('play', { title: 'Play' });
});

router.get('/download', checkAuth.checkLogin, function (req, res, next) {
	res.render('download', { title: 'Download' });
});

router.get('/dashboard', checkAuth.checkLogin, function (req, res, next) {
	var data = [];
	dbConnection.query('SELECT * FROM users where user_type=2', function (err, users) {
		if (err) throw err
		data.push({
			'usersCount': users.length,
			'projectsCount': '',
		});
		dbConnection.query('SELECT * FROM projects', function (err, projects) {
			if (err) throw err
			data[0].projectsCount = projects.length;
			data.push({ 'projectsCount': projects.length });
			res.render('dashboard', { title: 'Dashboard', data: data });

		});
	});

});


//forget password

// router.post('/forget-password', function(req, res, next){
// 	var email = req.body.email;
// 	dbConnection.query('SELECT * FROM users where email="'+email+'"', function (err, result) {
//         if(result.length!='0')
//         {	
// 			let resetLink= sendEmail.forget_password({email, session : req.session.login_id, req }); 
// 			// req.flash('success','Check you mail.');
// 			// res.redirect('/');
//         } else {
// 			req.flash('error', "Email-id not registered.");
// 			res.redirect('/');
//         }
//     });
// }); 

// Forget password
router.post('/forget-password', function (req, res, next) {
	var email = req.body.email;
	dbConnection.query('SELECT * FROM users where email="' + email + '"', function (err, result) {
		if (result.length != '0') {
			var randomPassword = Math.floor(100000 + Math.random() * 900000);
			console.log(randomPassword);
			var otp = Bcrypt.hashSync('"' + randomPassword + '"', 10);
			console.log(otp);
			// sending mail with new generated password
			var transporter = nodeMailer.createTransport({
				host: 'smtp.gmail.com',
				port: 587,
				secure: false,
				auth: {
					// should be replaced with real sender's account
					user: 'training.support@simulanis.com',
					pass: 'trainingsupport123'
				}
			});
			var mailOptions = {
				from: '"Simulanis" <no-reply@simulanis.com>', // sender address
				to: email, // list of receivers
				subject: "Reset Password Mail", // Subject line
				html: "<b>Hello " + email + ", </b><br><p>Use this OTP to reset you password. <br> OTP : " + randomPassword + "<p><br> Link : " + req.protocol + '://' + req.get('host') + "/verify-otp/" + result[0].id + "<p><br>" // html body
			};
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) throw error
				dbConnection.query('update users set otp=? where email=? ', [otp, email], function (err, result) {
					if (error) throw error
					req.flash('success', 'Your new password has been sent to your email address.');
					res.redirect('/');
				})
			});
		} else {
			req.flash('error', "Email-id not registered.");
			res.redirect('/');
		}

	});
});


// Change Password View
router.get('/change-password', checkAuth.checkLogin, function (req, res) {
	dbConnection.query('SELECT * FROM questions_list', function (err, Questions, fields) {
		if (err) console.log(this.err);
		req.flash('success', "Change tour password here");
		res.render('change-password', { title: 'Change Password', data: Questions });
	});
});



//Verify OTP View
router.get('/verify-otp/:id', function (req, res, next) {
	var id = req.params.id;
	res.render('verify-otp', { title: '360 Platform', userId: id });
});

// Reset Password 
router.post('/otp-verification', function (req, res, next) {
	var otp = req.body.otp;
	var userId = req.body.userid;
	dbConnection.query('SELECT * FROM users WHERE id = ?', [userId], (error, results, fields) => {
		if (error) return;
		if (results.length != 0) {
			if (Bcrypt.compareSync('"' + otp + '"', results[0].otp)) {
				req.flash('success', 'Change your password here');
				res.render('reset-password', { title: 'Reset Password', userId: userId });

			} else {
				req.flash('error', 'Wrong OTP.');
				res.render('verify-otp', { title: '360 Platform', userId: userId });
			}
		} else {
			req.flash('error', 'User not found');
			res.render('/');
		}
	});
});

// Reset Password 
router.post('/reset-password', function (req, res, next) {
	var userId = req.body.userid;
	var newPassword = req.body.newPassword;
	var confirmPassword = req.body.confirmPassword;
	// console.log(req.body);
	if (newPassword == confirmPassword) {
		dbConnection.query('SELECT * FROM users WHERE id = ?', [userId], (error, results, fields) => {
			if (results[0].otp != null || results[0].otp != undefined) {
				// console.log('ds');
				var otp = null;
				var date = new Date(new Date().toUTCString());
				dbConnection.query('update users set password=?,otp=?,status=?,created_at=? where id=? ', [Bcrypt.hashSync(req.body.newPassword, 10), otp, 1, date, userId], function (err, result) {
					if (error) return;
					req.flash('success', 'Password updated successfully.');
					res.render('index', { title: 'NPCL' });
				})
			} else {
				// console.log('dfg')
				req.flash('error', 'OTP expired, please try again');
				res.render('index', { title: 'NPCL' });
			}
		});
	} else {
		req.flash('error', 'New password and confirm password not matched.');
		res.render('reset-password', { title: 'Reset Password', userId: userId });
	}
});

// Update Password 
router.post('/update-password', checkAuth.checkLogin, function (req, res, next) {
	var email = req.body.email;
	var oldPassword = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var confirmPassword = req.body.confirmPassword;
	// console.log(req.body)
	if (newPassword == confirmPassword) {
		dbConnection.query('SELECT id,username,password,user_type FROM users WHERE email = ?', [email],
			(error, results, fields) => {
				if (Bcrypt.compareSync(oldPassword, results[0].password)) {
				    var date = new Date(new Date().toUTCString());
					dbConnection.query('update users set password=?, created_at=? where email=? ', [Bcrypt.hashSync(req.body.newPassword, 10),date, email], function (err, result) {
						if (error) throw error
						dbConnection.query('SELECT * FROM questions_list', (err, Questions) => {
							// console.log(this.sql);
							if (err) throw err
							req.flash('success', 'Password updated successfully.');
							res.render('change-password', { title: 'Change Password', data: Questions });
						});
					})
				} else {
					dbConnection.query('SELECT * FROM questions_list', (err, Questions) => {
						// console.log(this.sql);
						if (err) throw err
						req.flash('error', 'Old password not matched.');
						res.render('change-password', { title: 'Change Password', data: Questions });
					});
				}
			});
	} else {
		dbConnection.query('SELECT * FROM questions_list', (err, Questions) => {
			// console.log(this.sql);
			if (err) throw err
			req.flash('error', 'New password and confirm password not matched.');
			res.render('change-password', { data: Questions });
		});
	}
});

// Submit Answer
router.post('/submit-answer', checkAuth.checkLogin, function (req, res, next) {
	console.log(req.body);
	req.body.question.map((list, index) => {
		dbConnection.query('SELECT * FROM answer_list WHERE user_id="' + req.body.user_id + '"  AND question_id= "' + list + '"', (err, result) => {
			if (err) return
			if(result.length == 0){
				let insertUserAnwser = `insert into answer_list (user_id,question_id,answer,status) 
								values(
									"${req.body.user_id}",
									"${list}",
									"${req.body[list]}",
									0
								)`;
				dbConnection.query(insertUserAnwser, (err, result1) => {
					if (err) throw err
					if((req.body.question.length-1) == index){
						dbConnection.query('SELECT * FROM questions_list', function (err, Questions, fields) {
							if (err) console.log(this.err);
							req.flash('success', 'Submitted succesfully.');
							res.render('change-password', { data: Questions });
						});
					}
				})
			}else{
				let updateUserAnwser = `update answer_list set 
										user_id = "${req.body.user_id}",
										question_id="${list}",
										answer="${req.body[list]}",
										status=0 
										where id = "${result[0].id}"`;
				dbConnection.query(updateUserAnwser, (err, result2) => {
					if (err) throw err
					if((req.body.question.length-1) == index){
						dbConnection.query('SELECT * FROM questions_list', function (err, Questions, fields) {
							if (err) console.log(this.err);
							req.flash('success', 'Submitted succesfully.');
							res.render('change-password', { data: Questions });
						});
					}
				})
			}
			if((req.body.question.length-1) == index){
				dbConnection.query('SELECT * FROM questions_list', function (err, Questions, fields) {
					if (err) console.log(this.err);
					req.flash('success', 'Submitted succesfully.');
					res.render('change-password', { data: Questions });
				});
			}
		});
	});
});

//Match answer
router.post('/match-answer', function (req, res, next) {
	dbConnection.query('SELECT * FROM answer_list WHERE user_id="' + req.body.userId + '"', (err, result) => {
		if (err) return
		if(result.length != 0){
			req.body.question.map((list, index) => {
				dbConnection.query('SELECT * FROM answer_list WHERE user_id="' + req.body.userId + '"  AND question_id= "' + list + '"', (err, resultAnwer) => {
					if (err) return
					if(resultAnwer.length != 0){
						if(req.body[list] == resultAnwer[0].answer){
							let updateUserAnwser = `update answer_list set 
							status=1 
							where id = "${resultAnwer[0].id}"`;
							dbConnection.query(updateUserAnwser, (err, result2) => {
								if (err) throw err
								if((req.body.question.length-1) == index){
									dbConnection.query('SELECT * FROM answer_list WHERE user_id="' + req.body.userId + '" AND status=1', (err, total1) => {
										if (err) return
										var percent = (total1.length/req.body.question.length)*100;
										if(percent>=70){
											dbConnection.query('update users set status=1,created_at=now() where id ="' + req.body.userId + '"', (err, result2) => {
												if(err) console.log(err);
												dbConnection.query('update answer_list set status=1 where user_id ="' + req.body.userId + '"', (err, result2) => {
													if(err) return;
													req.flash('success', 'Your account is active now');
													res.render('index', { title: 'NPCL' });
												});
											});
										}else{
											req.flash('error', 'Your answer report is less than 70%, Please try again or use forget password');
											res.render('index', { title: 'NPCL' });
										}
									});
								}
							})
						}else{
							let updateUserAnwser = `update answer_list set 
							status=0 
							where id = "${resultAnwer[0].id}"`;
							dbConnection.query(updateUserAnwser, (err, result2) => {
								if (err) console.log(err);
								if((req.body.question.length-1) == index){
									dbConnection.query('SELECT * FROM answer_list WHERE user_id="' + req.body.userId + '" AND status=1', (err, total1) => {
										if (err) return
										console.log(total1.length);
										var percent = (total1.length/req.body.question.length)*100;
										console.log(percent);
										if(percent>=70){
											dbConnection.query('update users set status=1, created_at=now() where id ="' + req.body.userId + '"', (err, result2) => {
												if(err) return;
												dbConnection.query('update answer_list set status=1 where user_id ="' + req.body.userId + '"', (err, result2) => {
													if(err) return;
													req.flash('success', 'Your account is active now');
													res.render('index', { title: 'NPCL' });
												});
											});
										}else{
											req.flash('error', 'Your answer report is less than 70 percent, Please try again or use forget password');
											res.render('index', { title: 'NPCL' });
										}
									});
								}
							})
						}
					}else{
						req.flash('error', 'You did not submit any answer previously of these questions, Use forget password or contact to admin');
						res.render('index', { title: 'NPCL' });
					}
				});
			});
		}else{
			req.flash('error', 'You did not submit any answer previously, Use forget password or contact to admin');
			res.render('index', { title: 'NPCL' });
		}
	});
})




router.get('/logout', checkAuth.checkLogin, function (req, res, next) {
	req.session.destroy(function (err) {
		if (err) throw err
		res.redirect('/');
	});
});


module.exports = router;

