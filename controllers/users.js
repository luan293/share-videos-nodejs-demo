var sessUser = {};
renderRegUserController = function(req, res) {
  //return render("getusers", {params: 'test'})
  setSession(req, res);
  return res.render('regUser', {sessUser: sessUser.iduser});
}

regUserController = function(req, res) {
  var reqUser = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  };
  //open connection
  console.log(reqUser);
  var queryString = "INSERT INTO users (username, email, password) VALUES ('" + reqUser.username + "','" + reqUser.email + "','" + reqUser.password + "')";
  //var queryString = `insert into users (username, email, password) values ('test4', 'test4', '123123')`;
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
  //close connection
  //conn.end();
}

function checkLogin(req, res){
//  console.log(req.session.userlogin); 
  if(req.session.userlogin){

  } else {
    return res.render('loginUser');
  }
}

rederLoginUserController = function(req, res){
  setSession(req, res);
  checkLogin(req, res);
  searchUserbyId(req.session.userlogin.iduser)
    .then(function(user) {
      return res.redirect('/index');
    }, function(err) {
      return res.render('loginUser', {sessUser: sessUser.iduser})
    })
}

loginUserController = function(req, res) {
  var reqUser = {
    email: req.body.email,
    password: req.body.password
  };
  loginUser(reqUser.email, reqUser.password).then(function(user){
    req.session.userlogin = user[0];
    return res.redirect('/index');
  }, function(err){
    return res.render(err);
  })
}

function searchUserbyId(id) {
  return new Promise(function(resolve, reject) {
    var queryString = "SELECT * FROM users WHERE `iduser` = '" + id +"'";
    conn.query(queryString, function (err, rows) {
      if (err) {
        //return res.send(err);
        reject('khong tim thay user');
      }
      else
        resolve(rows);
    });
  });
}

function loginUser(email, password) {
  return new Promise(function(resolve, reject) {
    var queryString = "SELECT * FROM users WHERE `email` = '" + email + "' AND `password` = '" + password + "'";
    conn.query(queryString, function (err, rows) {
      if (err) {
        //return res.send(err);
        console.log(err);
        reject('sai pass');
      }
      else
        resolve(rows);
    });
  });
}
// function updateUserTimeStampbyKey(outOrin, key, time) {
//   var ref = refUser.child(key + '/timestamp');
//   ref.update({
//     [outOrin]: time
//   });
// }

logoutUserController = function(req, res) {
  //signed_in(req, res);
  req.session.destroy(function(err){
    if (err)
      return res.end(err);
    else
      return res.redirect('/login');
  });
}


function setSession(req, res) {
  if(req.session.userlogin){
    console.log('da log')   
    sessUser.iduser = req.session.userlogin.iduser
  } else {
    console.log('chua log') 
    sessUser.iduser = 0;
  }
}
// renderEditUserController = function(req, res) {
//   if(req.session.userlogin) {
//       return res.render('editUser');
//   } else {
//       return res.redirect('/login');
//   }
// }

// editUserController = function(req, res) {
//   // signed_in(req, res);
//   reqUser = {
//     key: req.body.key,
//     username: req.body.username,
//     password: req.body.password
//   };
//   refEdit = refUser.child(reqUser.key);
//   refEdit.update({
//     username: reqUser.username,
//     password: reqUser.password,    
//   }, function(err){
//     if(err) {
//       return res.end('khong update duoc ' + err);
//     } else {
//       reqUser.status = 200;
//       return res.json(reqUser);
//     }
//   });
  
// }

// deleteUserController = function(req, res){
//   reqUser = {
//     user: {
//       key: req.body.user.key
//     },
//     admin: {
//       role: req.body.admin.role
//     }
//   };
//   if(reqUser.admin.role === 1){
//     searchUserbyKey(reqUser.user.key).then(function(user){
//       var temp = user;
//       refUser.child(reqUser.user.key).remove();
//       temp.status = 200;
//       return res.json(temp);
//     }, function(err){
//       return res.end(err);
//     })
//   } else {
//     return res.end('khong co quyen admin');
//   }
// }

// searchUserController = function(req, res){
//   reqUser = {
//     name: req.params.name
//   }
//   searchUserbyName(reqUser.name).then(function(result){
//     resUser = {
//       status: 200,
//       keyword: reqUser.name,
//       result: result
//     }
//     return res.json(resUser);
//   }, function(err){
//     return res.end(err);
//   })
// }

// function searchUserbyName(name){
//   var result = []; 
//   return new Promise(function(resolve, reject) {
//     refUser.once('value')
//     .then(function(snapshot) {
//       var users = snapshot.val();
//       for(i in users){
//         if(users[i].username.search(name) >= 0){
//           result.push(users[i]);         
//         }
//       }
//       if(result.length > 0){
//         resolve(result);
//       } else {
//         reject('khong tim thay');
//       }       
//     });
//   });  
// }

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