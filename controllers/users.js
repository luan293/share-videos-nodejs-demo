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
        return res.render('regUser', {validEmail: 'Email đã được dùng'});
      } else if(!validateEmail(reqUser.email)) {
        return res.render('regUser', {validEmail: 'Email không hợp lệ'});
      } else if(reqUser.username.trim() == "") {
        return res.render('regUser', {validName: 'Name không được rỗng'});
      } else if(reqUser.password.length < 6) {
        return res.render('regUser', {validPw: 'Password phải ít nhất 6 ký tự'});
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

function validateEmail(email) {
    var re = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    return re.test(email);
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

//không có session login => về trang index
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