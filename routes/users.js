var express = require('express');
var router = express.Router();
var mysql = require('../dbConfig')
var dbConnection = mysql.connection
const { check, validationResult } = require('express-validator');
const Bcrypt = require("bcryptjs");
const checkAuth = require("../checkAuth");
const fs = require('fs');
var path  =  require('path'); 
var multer  =  require('multer'); 
var storage =  multer.diskStorage({  
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, '../public/uploads/profile/'));
  },   
  filename: function (req, file, callback) {   
    console.log(file);
    var imageExt = path.extname(file.originalname);
    callback(null, Date.now()+imageExt);  
  }  
});

var upload = multer({ storage : storage}).single('image');
router.get('/test', checkAuth.checkLogin, function(req, res, next) {
});


/* Admin - get users list */
router.get('/', checkAuth.checkLogin, function(req, res, next) {
  dbConnection.query('SELECT * from users where user_type=2', function (err, rows, fields) {
    if (err) throw err 
    res.render('users', {
        title: 'Users List', 
        data: rows
    })
  });
});

/* Admin - get users login history */
router.get('/login-history', checkAuth.checkLogin, function(req, res, next) {
    var rows = [];
    dbConnection.query('SELECT lh.user_id,lh.created_at,user.username,user.email,user.status from login_history as lh left join users as user on lh.user_id = user.id', function (err, result, fields) {
      if (err) return;
      result.map(function(list, i) {
        var created_at = new Date(list.created_at).toString();
        var d = new Date(list.created_at).toString();
        var index = d.lastIndexOf(':') +3
        var created_at =d.substring(0, index);
        rows.push({
            id: list.id,
            username: list.username,
            email: list.email, 
            status: list.status, 
            created_at: created_at,
          }); 
          if(result.length-1 == i){
            res.render('login-history', {
                title: 'Users List', 
                data: rows
            });
          }
      });
    });
  });


/* Admin - Add User Page */
router.get('/add-user', checkAuth.checkLogin, function(req, res, next) {
    res.render('add-user', {
        title:'Add User',
        username:'',
        email:'',
        phone_number:'',
        company_profile:'',
        professional_title:'',
        validationError:[]
    });
});


/* Admin - Save User Page */
router.post('/add-user', checkAuth.checkLogin, upload, [
              check('username','UserName field is required.').not().isEmpty(),
              check('email','Email field is required.').not().isEmpty(),
              check('email','Email must be a valid email-id.').isEmail(),
              check('password','Password field is required.').not().isEmpty(),
              check('phone_number','Phone Number field is required.').not().isEmpty(),
              check('phone_number','Phone Number must be a number.').isNumeric()
            ], function(req, res, next) {
              const errors = validationResult(req)
              console.log(errors);
              if (!errors.isEmpty()) {
                  res.render('add-user', {
                    title:'Add User',
                    username : req.body.username,
                    email : req.body.email,
                    phone_number : req.body.phone_number,
                    company_profile : req.body.company_profile,
                    professional_title : req.body.professional_title,
                    validationError : errors.array()
                });
              } else {
                var username = req.body.username;
                var email = req.body.email;
                if(req.file)
                {
                  var image = req.file.filename;
                }else {
                  var image = '';
                }
                var user = {
                        username: username,
                        email: email,
                        password: Bcrypt.hashSync(req.body.password, 10),
                        phone_number: req.body.phone_number,
                        company_profile: req.body.company_profile,
                        professional_title: req.body.professional_title,
                        otp: null,
                        wrong_attemp: 0,
                        image:image,
                        status: 1,
                        user_type: 2             //1-Admin, 2-User
                    }
                dbConnection.query('select * FROM users WHERE email= "'+email+'"' , function(err, result) {
                    if (err) throw err
                    if(result.length!=0)
                    {
                        req.flash('error', "User already exists.");
                        res.redirect('/users');
                    } else {
                        dbConnection.query('INSERT INTO users SET ?', user, function(err, result) {
                            if (err) throw err
                            req.flash('success', 'User added successfully!')
                            res.redirect('/users')
                        });
                    }
                });
              }           
});

/* Admin - Delete User Page */
router.get('/delete/:id', checkAuth.checkLogin, function(req, res, next) {
    var userId = req.params.id;
    dbConnection.query('select image FROM users WHERE id = ' + userId, function(err, row) {
        var imageName = row[0].image;
        if(imageName===null || imageName=='')
        {
        } else{
            var path = './public/uploads/profile/'+imageName;
            if (fs.existsSync(path)) {
              fs.unlinkSync(path, (err) => {
                 if (err) {
                    console.error(err);
                    return
                 }
              });
            }
        }
        dbConnection.query('DELETE FROM users WHERE id = ' + userId, function(err, result) {
            if (err) throw err
            req.flash('success', 'User deleted successfully!')
            res.redirect('/users')
        })
    })
});


/* Admin Edit User Details */
router.get('/edit-user/:id', checkAuth.checkLogin, function(req, res, next) {
    var userId = req.params.id;
    dbConnection.query('select * from users where id='+userId, function(err, result) {
        if (err) {
            req.flash('error', err)
            res.redirect('/users')
        } else {
            res.render('edit-user', {title:'Edit User', data:result[0]})
        }
    })
});


/* Admin Edit User Details */
router.post('/update-user', checkAuth.checkLogin, upload, [
                          check('username','UserName field is required.').not().isEmpty(),
                          check('phone_number','Phone Number field is required.').not().isEmpty(),
                          check('phone_number','Phone Number must be a number.').isNumeric()
  ], function(req, res, next) {
    console.log("req.body.userId");
    console.log(req.body.userId);
    var userId = req.body.userId;
    const errors = validationResult(req) 
    if (!errors.isEmpty()) {
        req.flash('validationError', errors.array());
        return res.redirect('/users/edit-user/'+userId);
    }
    var image = '';
    var old_image = req.body.old_image;
    var user_type = req.body.user_type;
    var username = req.body.username;
    var phone_number = req.body.phone_number;
    var company_profile = req.body.company_profile;
    var professional_title = req.body.professional_title;
    if(req.file)
    {
        if(old_image!='')
        {
            var path = './public/uploads/profile/'+old_image;
            console.log('Hello');
            if (fs.existsSync(path)) {
                fs.unlinkSync(path, (err) => {
                    if (err) {
                        console.error(err);
                        return
                    }
                });
            }
        }  

        image = req.file.filename;
   } else {
        image = old_image;
   }
    dbConnection.query('update users set username = ?, phone_number = ?,company_profile = ?,professional_title = ?,image = ? WHERE id = ?', [username,phone_number,company_profile,professional_title,image,userId], function(err, result) {
        if(err) throw err
        if(user_type == 1){
        	req.flash('success', 'User details updated successfully!')
        	res.redirect('/users') 
        }else{
        	req.flash('success', 'User details updated successfully!')
        	res.redirect('/users/edit-user/'+userId); 
        }
               
    })
});


/* Admin-Activate/Deactivate User */
router.get('/user-status-change/:id/:status', checkAuth.checkLogin, function(req, res, next) {
    var userId = req.params.id;
    var status = req.params.status;
    dbConnection.query('update users set status = ? WHERE id = ?', [status,userId], function(err, result) {
        if (err) {
            req.flash('error', err)
            res.redirect('/users')
        } else {
            req.flash('success', 'User status changed successfully!')
            res.redirect('/users')
        }
    })
});



//expire password
router.post('/password-expire', checkAuth.checkLogin, function(req, res, next) {
    
});


module.exports = router;
