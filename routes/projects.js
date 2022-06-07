var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path');
// fileUpload = require('express-fileupload')
// router.use(fileUpload());
const { check, validationResult } = require('express-validator');
var mysql = require('../dbConfig')
var dbConnection = mysql.connection
const fs = require('fs-extra')
const checkAuth = require("../checkAuth");
var shell = require('shelljs');
var randomstring = require("randomstring");
const { exec } = require("child_process");
const delay = require('delay');
const copydir = require('copy-dir');
var rimraf = require("rimraf");
var ncp = require('ncp').ncp;
var multer  =  require('multer'); 
const cons = require('consolidate');
var ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');   
const { json } = require('express');
var storage =  multer.diskStorage({  
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, '../public/uploads/projectsinventory/'));
  },  
  filename: function (req, file, callback) {
    var imageExt = path.extname(file.originalname);
    callback(null, Date.now()+randomstring.generate({length: 4, charset: 'numeric'})+imageExt);  
  }  
});

// var uploadInventory = multer({ storage : storage}).single('images');
var uploadInventory = multer({ storage : storage}).array('images');

/// All projects listing
router.get('/', checkAuth.checkLogin, function(req, res, next) {

    if(req.session.login_user_type=='1')
    {
        dbConnection.query('select p.*, u.username FROM projects as p LEFT JOIN users as u on p.userId = u.id', function(err, result) {
            if (err) throw err
            
            res.render('projects', {
                title: 'Projects List', 
                data: result
            })
        });
    } else {
       var id = req.session.login_id;
       const temp = [];
       console.log("coming"+id)
       dbConnection.query('select users.license_id,licenses.*  FROM users LEFT JOIN licenses on licenses.id = users.license_id WHERE users.id= "'+id+'"' , function(err, license_result) {
        if (err) throw err
        if(license_result[0].project_count == null){
          temp.push({
					  project_count: 2
					});
        }else{
          temp.push({
					  project_count: license_result[0].project_count
					});
        }
        // console.log("data"+license_result)
          //  dbConnection.query('select * FROM projects WHERE userId= "'+id+'"' , function(err, result) {
          dbConnection.query('select projects.*, users.license_id FROM projects LEFT JOIN users on users.id = projects.userId WHERE userId= "'+id+'"' , function(err, result) {
            if (err) throw err
            console.log("count"+temp[0].project_count);
            console.log("length"+result.length);

            console.log("license_result"+JSON.stringify(temp))
            res.render('user-projects', {
                title: 'Users Project List',
                data: result,
                license_data: temp
            })
          }); 
      });  
    }
});

// Users project Add
router.post('/add',checkAuth.checkLogin, function(req, res) {
  if(req.body.projectName=='' || req.body.version=='')
  {
      req.flash('error', 'Project Name & Version field is required.');
      return res.redirect('/projects');
  }
    var date = moment().format("YYYY-MM-DD hh:mm:ss");
    var userId = req.body.userId;
    var projectName = req.body.projectName;
    var version = req.body.version;
    var application_name = req.body.application_name;
    var status = '';

    if(req.body.status=='on')
    {
        status=1;
    } else {
        status=0;
    }
    data = {
        userId:userId,
        projectName:projectName,
        version:version,
        android:0,
        IOS:0,
        windows_desktop:0,
        web:0,
        pano:0,
        application_name:application_name,
        status:status
    }

    dbConnection.query('select * FROM projects WHERE userId= "'+userId+'" and projectName = "'+projectName+'"' , function(err, result) {
        if (err) throw err
        if(result.length!=0)
        {
            req.flash('error', "Project already exists.");
            return res.redirect('/projects');
        }
        else 
        {
              dbConnection.query('INSERT INTO projects SET ?', data, function(err, result) {
                  if (err)throw err
                     // var output = shell.cd('/home/simulanisco/public_html/NPCL2/views/projects/');
                     // if(output.code==0)
                     // {
                     //    const myShellScript = exec("cordova create project_id_"+result.insertId+" com.example.project_id_"+result.insertId+" "+application_name);
                     //     myShellScript.stderr.on('data', (shelldata)=>{                              
                     //         dbConnection.query('delete from projects where id='+result.insertId, function(err, result) {
                     //           if(err) throw err
                     //             console.log("delete");
                     //         });   
                     //    });
                     // }
                      req.flash('success', 'Project added successfully')
                      res.redirect('/projects');
              });  
        }
    });
});

router.post('/android_setup', checkAuth.checkLogin, function(req, res) {
    var projectId = req.body.projectId;
    dbConnection.query('select android from projects where id='+projectId, function(err,result){
        if(err) throw err
        if(result[0].android=='0')
        {
            var output = shell.cd('/home/simulanisco/public_html/NPCL2/views/projects/project_id_'+projectId);
            //console.log(output);
            if(output.code=='0')
            {
                const platformAdd = exec("cordova platform add android");
                platformAdd.stderr.on('data', (data)=>{
                  //console.log(data);
                });            
                dbConnection.query('update projects set android=? where id=?',['1',projectId], function(err_update,result_update){
                  if(err_update) throw err_update
                    function checkAndroidPlatform()
                    {
                      var androidPlatformPath = path.join(__dirname, '../views/projects/project_id_'+projectId+'/platforms/android/');
                        fs.stat(androidPlatformPath, function (err, stats){
                            if (err) {
                              console.log('Android Platform not found');
                            } else {
                               clearInterval(intervalObj);
                               console.log('Android Platform exists');
                               res.json({msg:'Success'});
                            }              
                        });
                    }
                    const intervalObj = setInterval(checkAndroidPlatform, 3000);
                });
            }      
        } else{
          res.json({msg:'Already'});
        }
    });
});

router.post('/android_build_setup', checkAuth.checkLogin, function(req, res) {
    var projectId = req.body.projectId;  
    var output = shell.cd('/home/simulanisco/public_html/NPCL2/views/projects/project_id_'+projectId);  //D:/Projects/NODE Projects/NPCL/projects/project_id_
    if(output.code=='0')
    {
        const myShellScript = exec("cordova build android");
        myShellScript.stderr.on('data', (shelldata)=>{
        });
        var data = {
            projectId:projectId,
            build_name:'app-debug.apk',
            build_type:1
        } 
        dbConnection.query('insert into downloads set ?',data, function(err,result){
            if(err) throw err
              function checkBuildFile()
              {
                  const filepath = path.join(__dirname, '../views/projects/project_id_'+projectId+'/platforms/android/app/build/outputs/apk/debug/app-debug.apk');
                  try {
                    if (fs.existsSync(filepath)) {
                      clearInterval(intervalObj);
                      console.log('Build created.');
                      res.json({msg:'Success'});
                    } else {
                      console.log('Build not created');
                    }
                  } catch(err) {
                    console.error(err)
                  }
              }
              const intervalObj = setInterval(checkBuildFile, 3000);
        });
    } else {
      res.json({msg:'Error'}); 
    }
});
   


router.post('/fetchBuilds', checkAuth.checkLogin, function(req, res) {
    var projectId = req.body.projectId;
    var build_type = req.body.build_type;
    dbConnection.query('select * from downloads where projectId='+projectId+' and build_type="'+build_type+'"', function(err,result){
      if(err) throw err
      res.json({msg:'Success', builds:result}); 
    });
});


router.get('/edit-project/:projectId', checkAuth.checkLogin, function(req, res) {
    var projectId = req.params.projectId;
    dbConnection.query('select * FROM projects WHERE id= "'+projectId+'"' , function(err, result) {
        if (err) throw err
        res.render('edit-project', {
            title: 'Edit Project', 
            data: result[0]
        })
    });
});


router.post('/update-project', checkAuth.checkLogin,  [
              check('projectName','Project Name field is required.').not().isEmpty(),
              check('version','Version field is required.').not().isEmpty()
            ], function(req, res) {
    var projectName = req.body.projectName;
    var version = req.body.version;
    var status = '';
    var userId = req.body.userId;
    var projectId = req.body.projectId;
    if(req.body.status=='1')
    {
      status = '1';
    } else {
      status = '0';
    }
    dbConnection.query('update projects SET projectName=?, version=?, status=? where id=? ', [projectName,version,status,projectId], function(err, row) {
        if (err) throw err
        req.flash('success', 'Project updated successfully!')
          res.redirect('/projects');
    });
});


router.post('/upload-project-inventory', checkAuth.checkLogin, uploadInventory, function(req, res) {
      var projectId = req.body.projectId;
      if (!req.files)
      {
        req.flash('error', 'files not Uploaded !!')
        return res.redirect('/projects/view360/'+projectId)
      }
      var totalfiles = req.files.length;
      if(totalfiles>0)
      {
          req.files.forEach(function(files,index){
            //console.log(files.originalname)
              var filename = files.filename
              //console.log(filename)
              var fileType = files.mimetype
              var fileTypeArray = fileType.split("/");
              var uploadFileType;
              var thumbnail_path = path.parse(filename).name; 
              if(fileTypeArray[0] == "video"){
                var src = req.protocol + '://' + req.get('host')+'/uploads/projectsinventory/'+filename;
                var upload_folder = path.join(__dirname, '../public/uploads/projectsinventory/');
                ffmpeg(src)
                .setFfmpegPath(ffmpeg_static)
                .screenshots({
                  timestamps: [0.0],
                  filename: thumbnail_path+'_thumbnail.png',
                  folder: upload_folder
                }).on('end', function() {
                  console.log('done');
                });
              }
              switch(fileTypeArray[0]) 
              {
                  case "image":
                    uploadFileType = '1';
                    break;
                  case "video":
                    uploadFileType = '2';
                    break;
                  case "audio":
                    uploadFileType = '3';
                    break;
                  // default:
                  //   uploadFileType = '3';
              }
              var data = {
                     filename:filename,
                     projectId:projectId,
                     original_filename:files.originalname,
                     fileType:uploadFileType,
                     thumbnail:thumbnail_path+'_thumbnail.png'

                  }
              dbConnection.query('INSERT INTO projectinventory SET ?', data, function(err, result){
                if(err){
                  throw err
                }
              })
              if((totalfiles-1)==index)
              {
                req.flash('success', 'Uploaded !!')
                res.redirect('/projects/view360/'+projectId)
              }
          })
      } else{
        req.flash('error', 'Please upload files.')
        res.redirect('/projects/view360/'+projectId)
      }
});

/* Delete Project Image/Video */
router.post('/add-audio', checkAuth.checkLogin, function(req, res, next) {
    dbConnection.query('update projectviews set custom_audio=?,ismuted=? where id=?',[req.body.custom_audio,req.body.ismuted,req.body.viewId], function(updateerr, updateresult) {
        if (updateerr) throw updateerr
        res.json({'msg':'Success'})
    });

})


/* Delete Project Image/Video */
router.get('/delete-project-inventory/:id/:projectId/:filename/:filetype', checkAuth.checkLogin, function(req, res, next) {
      var viewCounter=0;
      var id = req.params.id;
      var projectId = req.params.projectId;
      var imageName = req.params.filename;
      var filetype = req.params.filetype;
      if(filetype==3)
      {
          // find hotspot icon name and update null in hotspot icon
          dbConnection.query('update projectviews set custom_audio=? WHERE custom_audio=?', ['',imageName], function(audioerr, audioresult) {
            if (audioerr) throw audioerr 
              console.log('Custom audio updated.')
          })
      } else {
          //delete inventory name related hotspot
          dbConnection.query('delete from projecthotspots WHERE hotspot_data="'+imageName+'"', function(hotspotimgerr, hotspotimgresult) {
            if (hotspotimgerr) throw hotspotimgerr 
            console.log('Inventory related hotspot record deleted successfully.')
          })
          // find hotspot icon name and update null in hotspot icon
          dbConnection.query('update projecthotspots set hotspot_icon=? WHERE hotspot_icon=?', ['',imageName], function(hotspoticonupdateerr, hotspoticonupdateresult) {
            if (hotspoticonupdateerr) throw hotspoticonupdateerr 
              console.log('Hotspot icon updated.')
          })
          //fetch project views 
          dbConnection.query('select * FROM projectviews WHERE data="'+imageName+'"', function(err, result) {
            if (err) throw err 
            if(result.length>0){
              viewCounter = 1;
                // loop for views 
                result.forEach(function (list, index) {
                  // delete views hotspot
                    dbConnection.query('delete from projecthotspots WHERE viewId='+list.id, function(hotspoterr, hotspotresult) {
                      if (hotspoterr) throw hotspoterr
                      console.log('Views hotspot deleted successfully.')
                    })
                })  
                // delete views
                dbConnection.query('delete FROM projectviews WHERE data="'+imageName+'"', function(viewserr, viewsresult) {
                  if (viewserr) throw viewserr
                  //delete inventory file from asset folder
                  var inventoryViewPath = path.join(__dirname, '../views/projects/project_id_'+projectId+'/www/asset/'+imageName);
                  if (fs.existsSync(inventoryViewPath)) {
                    fs.unlinkSync(inventoryViewPath, (err) => {
                      if (err) {
                        console.error(err);
                        return
                      }
                      console.log('Inventory related view file deleted successfully.')
                    });
                  }   
                  console.log('Views deleted successfully.')
                })
            }
          });
      }
      // delete inventory
      dbConnection.query('DELETE FROM projectinventory WHERE id='+ id, function(err, result) {
          if (err) throw err
          var inventoryPath = path.join(__dirname, '../public/uploads/projectsinventory/'+imageName);
          if (fs.existsSync(inventoryPath)) {
            console.log('file exists')
            fs.unlinkSync(inventoryPath, (err) => {
                if (err) {
                  console.error(err); 
                }
            });
          }
      })
      if(viewCounter==1)
      {
        req.flash('success', 'Deleted !!')
        res.redirect('/projects/generateJson/'+projectId+'/1')
      }
      else
      {
        req.flash('success', 'Deleted !!')
        res.redirect('/projects/view360/'+projectId)
      }
});  

// 360 View Page Projects
router.get('/view360/:id', checkAuth.checkLogin, function(req, res, next) {
  var id = req.params.id;
  var user_id = req.session.login_id;

  console.log('user id'+user_id);
  // var temp = [];                                
                
  // console.log("view come2");
  dbConnection.query('select users.license_id,licenses.*  FROM users LEFT JOIN licenses on licenses.id = users.license_id WHERE users.id= "'+user_id+'"' , function(err, license_result) {
    if (err) console.log("error comes"+err)
    console.log("view come2"+JSON.stringify(license_result, null, "  "));

    if(license_result[0].scene_count == null){
      temp.push({
        scene_count: 3
      });
    }else{ 
      temp.push({
        scene_count: license_result[0].scene_count 
      });
    } 
    dbConnection.query('select * FROM projectviews WHERE projectId='+id+' order by id asc' , function(err, sceneData) {
      if (err) console.log("error comes"+err)
       console.log("view come1"+JSON.stringify(temp, null, "  "));
      // console.log(JSON.stringify(temp[0].scene_count));
      res.render('view',{title:'360 Platform', projectId:id, license_data: temp, sceneData: sceneData});
   });
  //   console.log(JSON.stringify(temp[0].scene_count));
  //  res.render('view',{title:'360 Platform', projectId:id, license_data: temp});

 });
// res.render('view',{title:'360 Platform', projectId:id});

  // console.log("view come");
});

router.post('/fetchInventoryData', checkAuth.checkLogin, function(req, res, next) {
  var projectId = req.body.projectId;
  dbConnection.query('select * FROM projectinventory WHERE projectId= "'+projectId+'" or default_inventory=1 order by created_at DESC', function(err, result) 
  {
    if (err) throw err
    res.json({msg:"Success",inventory:result});
  });  
});


router.post('/fetchViewData', checkAuth.checkLogin, function(req, res, next) {
  var projectId = req.body.projectId;
  dbConnection.query('select * FROM projectviews WHERE projectId='+projectId+' order by id asc', function(err, result) {
      if (err) throw err
        if(result.length>0)
        {   var temp = 0; 
            result.map((list, index) => {
                list['hotspot']=[];
                dbConnection.query('select * FROM projecthotspots WHERE viewId= "'+list.id+'"', function(hotspotserr, hotspotsresult) {
                if (hotspotserr) throw hotspotserr
                  var subtractWith=0;
                    if(hotspotsresult.length>0)
                    {     
                        subtractWith=1;
                        hotspotsresult.map((hotspotlist, hotspotindex) => {
                          temp = hotspotindex
                          result[index].hotspot.push({id:hotspotlist.id,hotspot_data:hotspotlist.hotspot_data,hotspot_type:hotspotlist.hotspot_type,hotspot_icon:hotspotlist.hotspot_icon,hotspot_title:hotspotlist.hotspot_title});
                        });
                    }
                    if(((result.length-1) == index))
                    {
                      res.json({msg:"Success",views:result});
                    }
              });
            })
        } else {
            res.json({msg:"Success",views:result});
        }
      });
});


router.get('/fetch-hotspot-data/:viewId', checkAuth.checkLogin, function(req, res, next) {
  var viewId = req.params.viewId;
  dbConnection.query('select * FROM projecthotspots WHERE viewId='+viewId, function(err, result) 
  {
    if (err) throw err
      res.json({msg:"Success",hotspots:result});
  });
  
});


router.post('/addview', checkAuth.checkLogin, function(req, res) {
    dbConnection.query('select pano from projects where id='+req.body.projectId, function(projecterr, projectresult) {
        if (projecterr) throw projecterr
        if(projectresult[0]['pano']=='0')
        {
          var source = path.join(__dirname, '../packages/www/');
          var destination = path.join(__dirname, '../views/projects/project_id_'+req.body.projectId+'/www/');
          fs.copy(source, destination, function (err) {
              if (err){
                return;
              }
              dbConnection.query('update projects set pano=? where id=?',['1',req.body.projectId], function(updateerr, updateresult) {
                  if (updateerr) throw updateerr
              });
          });           
        }
        var viewData = {viewname:req.body.viewname,projectid:req.body.projectId,data:req.body.data,view_filetype:req.body.view_filetype,custom_audio:'',ismuted:0};
        dbConnection.query('insert into projectviews set ?',viewData, function(err, result) {
            if (err) throw err
            dbConnection.query('update projects set web=? where id=?',['0',req.body.projectId], function(updateweberr, updatewebresult) {
                if (updateweberr) throw updateweberr
                res.json({msg:'Success'});
            });
            
        });
    });
});


// Add hotspot for views
router.post('/addhotspot', checkAuth.checkLogin, function(req,res,next){
  var hotspot_icon = '';
	if(req.body.hotspot_icon==undefined || req.body.hotspot_icon=='' )
  {
      hotspot_icon = null;
  } else{
      hotspot_icon = req.body.hotspot_icon;
  }
	var data = {
		 viewId : req.body.viewId,
     hotspot_title : req.body.hotspot_title,
		 x : req.body.x,
		 y : req.body.y,
		 z : req.body.z,
		 hotspot_type : req.body.hotspot_type,
		 hotspot_icon : hotspot_icon,
		 hotspot_data : req.body.hotspot_data
	}
	dbConnection.query('insert into projecthotspots set ?',data, function(err, result) {
    if (err) throw err
    dbConnection.query('update projects set web=? where id=?',['0',req.body.projectId], function(updateweberr, updatewebresult) {
        if (updateweberr) throw updateweberr
        res.json({'msg':'Success'});
    });	
	})
})


// write json 
router.get('/generateJson/:id/:type?', checkAuth.checkLogin, function(req, res, next) {
      var projectId = req.params.id;
      var type = req.params.type;
      var o = {};
      var key = 'data';
      o[key] = [];
      var hostpotArray = [];
      var data = [];
      var counter = 0;
      dbConnection.query('select * FROM projectviews WHERE projectId= "'+projectId+'" ORDER BY id ASC', function(err, result) {
              if (err) throw err
              if(result.length>0){
                  result.forEach(function(view) {
                    var source  = path.join(__dirname, '../public/uploads/projectsinventory/'+view.data);
                    var destination = path.join(__dirname, '../views/projects/project_id_'+projectId+'/www/asset/'+view.data);
                      fs.copyFile(source, destination, function (err) {
                        if (err) {
                            console.log("An error occured while Copied file.");
                            return console.log(err);
                        }
                        console.log("Copied file.");
                      });
                      if(view.custom_audio!='')
                      {
                        var sourceAudio  = path.join(__dirname, '../public/uploads/projectsinventory/'+view.custom_audio);
                        var destinationAudio = path.join(__dirname, '../views/projects/project_id_'+projectId+'/www/asset/'+view.custom_audio);
                          fs.copyFile(sourceAudio, destinationAudio, function (err) {
                            if (err) {
                                console.log("An error occured while Copied file.");
                                return console.log(err);
                            }
                            console.log("Audio file copied .");
                          });
                      }
                      dbConnection.query('select * FROM projecthotspots WHERE viewId= "'+view.id+'"', function(hotspotserr, hotspotsresult) {
                      if (hotspotserr) throw hotspotserr
                        hostpotArray = [];
                        var i=0;
                        if(hotspotsresult.length>0){
                            hotspotsresult.forEach(function(hotspot) {
                              if(hotspot.hotspot_type!='1' && hotspot.hotspot_type!='4'){
                                var sourceHotspot = path.join(__dirname, '../public/uploads/projectsinventory/'+hotspot.hotspot_data)
                                var destinationHotspot = path.join(__dirname, '../views/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_data)
                                fs.copyFile(sourceHotspot, destinationHotspot, function (err) {
                                  if (err) {
                                      return;
                                  }
                                });                               
                              }
                              if(hotspot.hotspot_icon!='')
                              {
                                var sourceHotspotIcon = path.join(__dirname, '../public/uploads/projectsinventory/'+hotspot.hotspot_icon)
                                var destinationHotspotIcon = path.join(__dirname, '../views/projects/project_id_'+projectId+'/www/asset/'+hotspot.hotspot_icon)
                                fs.copyFile(sourceHotspotIcon, destinationHotspotIcon, function (err) {
                                  if (err) {
                                      return;
                                  }
                                }); 
                              }
                              var typeValue;
                              var hotspotValue='';
                              var trigger;
                              var defaultImg;
                              console.log("hotspot.hotspot_type");
                              console.log(hotspot.hotspot_type);
                              console.log(hotspot.hotspot_data);
                              switch(hotspot.hotspot_type){
                                case 1:
                                  typeValue = 'trigger';
                                  trigger = hotspot.hotspot_data.toString();
                                  defaultImg = 'hotspot.png';
                                  break;
                                case 2:
                                  typeValue = 'image';
                                  trigger = hotspot.hotspot_data;
                                  defaultImg = 'image.png';
                                  break;
                                case 3:
                                  typeValue = 'video';
                                  trigger = hotspot.hotspot_data;
                                  defaultImg = 'video.png';
                                  break;
                                case 4:
                                  typeValue = 'text';
                                  trigger = hotspot.hotspot_data;
                                  defaultImg = 'text.png';
                                  break;
                                case 5:
                                  typeValue = 'music';
                                  trigger = hotspot.hotspot_data;
                                  defaultImg = 'music.png';
                                  break;
                                case 6:
                                  typeValue = 'gif';
                                  trigger = hotspot.hotspot_data;
                                  defaultImg = 'music.png';
                                  break;
                              }
                              hostpotArray[i]= {x:hotspot.x, y:hotspot.y, z:hotspot.z, img:(hotspot.hotspot_icon!=null) ? hotspot.hotspot_icon : defaultImg, type:typeValue, image:hotspot.hotspot_data, video:hotspot.hotspot_data, text:hotspot.hotspot_data, gif:hotspot.hotspot_data, trigger:trigger};
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
                        data = {id:view.id.toString(), background:view.data, backgroundtype:(view.view_filetype == 1)? 'img': 'video', ismuted: ismuted, audio: (view.custom_audio!=null)?view.custom_audio:'', hotspot:hostpotArray}                        
                        counter++;
                        o[key].push(data);
                        if(result.length==counter)
                        {
                          var jsonContent = JSON.stringify(o, null, 4);
                          var jsonPath = path.join(__dirname, '../views/projects/project_id_'+projectId+'/www/data.json');
                          fs.writeFile(jsonPath, jsonContent, 'utf8', function (err) {
                              if (err) {
                                  return console.log(err);
                              }

                              dbConnection.query('update projects set web=? where id=?',['1',projectId], function(err_update,result_update){
                                if(err_update) throw err_update
                              });
                              if (type=='2') {
                                res.json({'msg':'Success'})
                              } else if(type=='1'){
                                res.redirect('/projects/view360/'+projectId)
                              }
                          }); 
                        }
                        
                      });
                  })
            }
        });
});

router.get('/preview-webview/:projectId', function(req,res,err){
  dbConnection.query("select * from projectviews where projectid="+req.params.projectId, function(err,result){
    if(err) throw err
    if(result.length==0)
    {
      req.flash('error', 'Project tour not created. Please create tour for webview.')
      res.redirect('/projects/deployment')
    } else{
      res.render('projects/project_id_'+req.params.projectId+'/www/index',{projectId:req.params.projectId})
    }
  });
});



router.get('/delete-views/:projectId/:viewId', checkAuth.checkLogin, function(req,res,err){
    var viewId = req.params.viewId;
    var projectId = req.params.projectId;
    var sql = "delete FROM projectviews WHERE id = ?; delete FROM projecthotspots WHERE viewId = ?";
    dbConnection.query(sql, [viewId, viewId], function(err_del,result_del){
      if(err_del) throw err_del
      res.redirect('/projects/generateJson/'+projectId+'/2')
    });
})


router.get('/delete-hotspot/:projectId/:hotspotId', checkAuth.checkLogin, function(req,res,err){
    var projectId = req.params.projectId;
    var hotspotId = req.params.hotspotId;
    dbConnection.query('delete from projecthotspots where id=?',[hotspotId], function(err_del,result_del){
      if(err_del) throw err_del
      res.redirect('/projects/generateJson/'+projectId+'/2')
    });
})

// Deployment Page Listing
 router.get('/deployment', checkAuth.checkLogin, function(req, res, next) {
     
      var user_id = req.session.login_id;
      if(user_id)
      {
          dbConnection.query('select * FROM projects WHERE userId= "'+user_id+'" and status=1', function(err, result) {
              if (err) throw err
              res.render('deployment', { title: 'Deployment', data:result })
          });
      } else {
          res.redirect('/')
      }
         
});


// Downloads Page List
router.get('/downloads', checkAuth.checkLogin, function(req, res, next) {
     
      var user_id = req.session.login_id;
      if(user_id)
      {
          dbConnection.query('select * FROM projects WHERE userId= "'+user_id+'" and status=1', function(err, result) {
              if (err) throw err
              res.render('downloads', { title: 'Downloads', data:result })
          }); 
      } else {
          res.redirect('/')
      }
        
});




// Delete Project
router.get('/delete-project/:projectId', checkAuth.checkLogin, function(req, res, next) {
     
        var projectId = req.params.projectId;

        //fetch inventory and unlink inventory files from uploads
        dbConnection.query('select * from projectinventory where projectId='+projectId, function(inventoryerr,inventoryresult){
            if(inventoryerr) throw inventoryerr
            if(inventoryresult.length>0)
            {
                inventoryresult.forEach(function(inventorylist,index) {
                  var inventoryPath = path.join(__dirname, '../public/uploads/projectsinventory/'+inventorylist.filename);
                  if (fs.existsSync(inventoryPath)) {
                      fs.unlinkSync(inventoryPath, (err) => {
                          if (err) {
                            console.error(err); 
                          }
                          console.log('Inventory files deleted.');
                      });
                  } 
                });
            }
                        
        });


        //delete inventory record from inventory table
        dbConnection.query('delete from projectinventory where projectId='+projectId, function(inventoryDelErr,inventoryDelResult){
            if(inventoryDelErr) throw inventoryDelErr
            console.log('Inventory record from table deleted successfully.');
        });


        //fetch views and its hotspots & Delete hotspots from table
        dbConnection.query('select * from projectviews where projectId='+projectId, function(viewserr,viewsresult){
            if(viewserr) throw viewserr
            hotspotIdArray = [];
            if(viewsresult.length>0){
                viewsresult.forEach(function(viewslist,index) {
                  dbConnection.query('select * from projecthotspots where viewId='+viewslist.id, function(hotspoterr,hotspotresult){
                      if (hotspoterr)  throw hotspoterr
                      if(hotspotresult.length>0){
                          hotspotresult.forEach(function(hotspotlist,index) {
                            hotspotIdArray.push(hotspotlist.id);
                          })
                      }
                      //Delete hotspots
                      if(index==viewsresult.length-1)
                      {
                        dbConnection.query('delete from projecthotspots where id IN (?) ',[hotspotIdArray], function(hotspotDelErr,hotspotDelResult){
                          if(hotspotDelErr) throw hotspotDelErr
                          console.log('Hotspot deleted successfully.')
                        })
                      }
                  })
                  
              });
            }
            
        });


        //delete view record from views table
        dbConnection.query('delete from projectviews where projectId='+projectId, function(viewDelErr,viewDelResult){
            if(viewDelErr) throw viewDelErr
            console.log('Views from table deleted successfully.');
        });


        // directory path
        var projectTour = path.join(__dirname, '../views/projects/project_id_'+projectId);

        //console.log(projectTour);
        fs.access(projectTour, function(error) {
          //console.log('exists');
          rimraf(projectTour, function () { console.log("project tour deleted successfully."); });
          
        })
        
        
        //delete project from projects table
        dbConnection.query('delete from projects where id='+projectId, function(err,result){
          if(err) throw err
          console.log('Project deleted successfully.')
        });

        req.flash('success', 'Project Deleted!!')
        res.redirect('/projects')
        
});
 



router.get('/video-editor/:projectId', checkAuth.checkLogin, function(req,res,next){
    //console.log(req.body.projectId);
    dbConnection.query('select * from projectinventory where filetype=2 and projectId='+req.params.projectId, function(err,result){
        if(err) throw err
        //console.log(result);
        dbConnection.query('select * from projects where id='+req.params.projectId, function(projecterr,projectresult){
          if(projecterr) throw projecterr

            res.render('video-editor', {data:result, project_name:projectresult[0].projectName}); 
        });          
    });
});

module.exports = router;
