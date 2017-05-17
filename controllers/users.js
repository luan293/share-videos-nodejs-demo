//var sessUser = {};
renderRegUserController = function(req, res) {
  //return render("getusers", {params: 'test'})
  setSession(req, res);
  return res.render('regUser', {sessUser: sessUser});
}

regUserController = function(req, res) {
  var reqUser = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  };
  //open connection
  searchUserbyEmail(reqUser.email)
    .then(function(users){
      if(users.length > 0) {       
        return res.render('regUser', {validReg: 'Email đã được dùng'});
      } else {
        //var queryString = "INSERT INTO users (username, email, password) VALUES ('" + reqUser.username + "','" + reqUser.email + "','" + reqUser.password + "')";
        var queryString = `insert into users (username, email, password) values ('${reqUser.username}', '${reqUser.email}', '${reqUser.password}')`;
        //create, excute query
        //var queryString = "SELECT * FROM users";
        conn.query(queryString, function (err, rows) {
          if (err) {
            //return res.send(err);
            console.log(err);
            return res.render('regUser');
          }
          else
            return res.redirect('index');
        });
      }
    });
  //close connection
  //conn.end();
}

function searchUserbyEmail(email) {
  return new Promise(function(resolve, reject) {
    //var queryString = "SELECT * FROM users WHERE `iduser` = '" + id +"'";
    var queryString = `SELECT * FROM users WHERE email = '${email}'`;
    conn.query(queryString, function(err, rows) {
      if(err) {
        //return res.send(err);
        reject('khong tim thay user');
      } else {
        resolve(rows);
      }
    });
  });
}

function checkLogin(req, res){
//  console.log(req.session.userlogin); 
  if(req.session.userlogin){
    return true;
  } else {
    return res.redirect('/login');
  }
}

rederLoginUserController = function(req, res){
  setSession(req, res);
  if(req.session.userlogin){
    searchUserbyId(req.session.userlogin.iduser)
    .then(function(user) {
      return res.redirect('/index');
    }, function(err) {
      return res.render('loginUser');
    });
  } else {
    return res.render('loginUser', {sessUser: sessUser});
  }
  
}

loginUserController = function(req, res) {
  var reqUser = {
    email: req.body.email,
    password: req.body.password
  };

  loginUser(reqUser.email, reqUser.password).then(function(user) {
    if(user.length > 0) {
      req.session.userlogin = user[0];      
      return res.redirect('/index');
    } else {
      return res.render('loginUser', {validLogin: 'Sai password hoặc email'});
    }   
  }, function(err) {
    return res.render('loginUser', {validLogin: err});
  });
}

function searchUserbyId(id) {
  return new Promise(function(resolve, reject) {
    //var queryString = "SELECT * FROM users WHERE `iduser` = '" + id +"'";
    var queryString = `SELECT * FROM users WHERE iduser = '${id}'`;
    conn.query(queryString, function(err, rows) {
      if(err) {
        //return res.send(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function loginUser(email, password) {
  return new Promise(function(resolve, reject) {
    //var queryString = "SELECT * FROM users WHERE `email` = '" + email + "' AND `password` = '" + password + "'";
    var queryString = `SELECT * FROM users WHERE email =  '${email}'  AND password = '${password}'`;
    conn.query(queryString, function (err, rows) {
      if(err) {
        //return res.send(err);
        //console.log(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

logoutUserController = function(req, res) {
  //signed_in(req, res);
  req.session.destroy(function(err){
    if(err)
      return res.end(err);
    else
      return res.redirect('/login');
  });
}

function setSession(req, res) {
  if(req.session.userlogin){
    sessUser.iduser = req.session.userlogin.iduser;
  } else {
    sessUser.iduser = 0;
  }
}

module.exports = {
  renderRegUserController: renderRegUserController,
  regUserController: regUserController,
  rederLoginUserController: rederLoginUserController,
  loginUserController: loginUserController,
  logoutUserController: logoutUserController,
  checkLogin: checkLogin
  // renderEditUserController: renderEditUserController,
  // editUserController: editUserController,
  // deleteUserController: deleteUserController,
  // searchUserController: searchUserController,
}