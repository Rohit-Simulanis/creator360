var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const checkAuth = require("../checkAuth");
var mysql = require('../dbConfig')
var nodeMailer = require('nodemailer')
var randomstring = require("randomstring");
var dbConnection = mysql.connection


/// All licenses listing
router.get('/', checkAuth.checkLogin, function(req, res, next) {

    if(req.session.login_user_type=='1')
    {
        dbConnection.query('select * FROM licenses where status != "trashed"', function(err, result) {
            if (err) throw err
            
            res.render('licenses', {
                title: 'Licenses List', 
                data: result
            })
        });
    } else {
        console.log("user licenses");
    //    var id = req.session.login_id;
    //    dbConnection.query('select * FROM projects WHERE userId= "'+id+'"' , function(err, result) {
    //       if (err) throw err
          
    //       res.render('user-projects', {
    //           title: 'Users Project List',
    //           data: result
    //       })
    //    }); 
    }
});



/* Admin - Add User Page */
router.get('/add-license', checkAuth.checkLogin, function(req, res, next) {
    // console.log('coming');
    res.render('add-license', {
        title:'Add License',
        license_name:'',
        license_description:'',
        price:'',
        license_type:'',
        project_count:'',
        scene_count:'',
        status:'',
        validationError:[]
    });
});


// Add License
router.post('/add-license',checkAuth.checkLogin, [
        check('license_name','License Name field is required.').not().isEmpty(),
        check('license_description','License Description field is required.').not().isEmpty(),
        check('price','Price field is required.').not().isEmpty(),
        check('license_type','License Type must be a selected.').not().isEmpty(),
        check('status','Status field is required').not().isEmpty()
    ], function(req, res) {
       // console.log(req.body.license_name);
        const errors = validationResult(req)
      //  console.log(errors);
        if (!errors.isEmpty()) {
            res.render('add-license', {
              title:'Add License',
              license_name : req.body.license_name,
              license_description : req.body.license_description,
              price : req.body.price,
              license_type : req.body.license_type,
              project_count : req.body.project_count,
              scene_count : req.body.scene_count,
              status : req.body.status,
              validationError : errors.array()
          });
        } else {
          //  var date = moment().format("YYYY-MM-DD hh:mm:ss");
            var license_name = req.body.license_name;
            var license_description = req.body.license_description;
            var price = req.body.price;
            var license_type = req.body.license_type;
            var project_count = req.body.project_count;
            var scene_count = req.body.scene_count;
            var status = req.body.status;
            data = {
                license_name:license_name,
                license_description:license_description,
                price:price,
                license_type:license_type,
                project_count:project_count,
                scene_count:scene_count,
                status:status
            }
        
            dbConnection.query('select * FROM licenses WHERE license_name = "'+license_name+'"', function(err, result) {
                if (err) throw err
                if(result.length!=0)
                {
                    req.flash('error', "License already exists.");
                    return res.redirect('/licenses');
                }
                else 
                {
                      dbConnection.query('INSERT INTO licenses SET ?', data, function(err, result) {
                          if (err)throw err
                              req.flash('success', 'License added successfully')
                              res.redirect('/licenses');
                      });  
                }
            });
      
        }
      });


/* Admin-Activate/Deactivate License */
router.get('/license-status-change/:id/:status', checkAuth.checkLogin, function(req, res, next) {
    var licenseId = req.params.id;
    var status = req.params.status;
    console.log(status);
    console.log(licenseId);
    dbConnection.query('update licenses set status = ? WHERE id = ?', [status,licenseId], function(err, result) {
        if (err) {
            req.flash('error', err)
            res.redirect('/licenses')
        } else {
            req.flash('success', 'License status changed successfully!')
            res.redirect('/licenses')
        }
    })
});
module.exports = router;

