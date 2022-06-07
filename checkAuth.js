function checkAuth(){
	return(req,res,next) => {
		if (!req.session.login_id) {
		   req.flash('error', "Please login first.");
			res.redirect('/');
	    } else{
	    	next();
	    }
	}
}

module.exports.checkLogin = checkAuth();

