var userController = require('./users');
var refUser = firebase.database().ref('chat-log');
var sessUser = {};
renderPostVideoController = function(req, res) {
  //signed_in(req, res);
  setSession(req, res);
  userController.checkLogin(req, res);
  return res.render('postVideo', {sessUser: sessUser.iduser});
}

postVideoController = function(req, res) {
  //signed_in(req, res);
  checkLogin(req, res);
  var reqVid = {
    title: req.body.title,
    url: req.body.url,
    iduser: req.session.userlogin.iduser
  };
  console.log(reqVid);
  var queryString = "INSERT INTO videos (idauthor, title, url) VALUES ('" + reqVid.iduser + "','" + reqVid.title + "','" + reqVid.url + "')";
  conn.query(queryString, function (err, rows) {
    if (err) {
      //return res.send(err);
      console.log(err);
      return res.render('postVideo');
    }
    else
      return res.redirect('index');
  });

}

detailsVideoController = function(req, res) {
  //signed_in(req, res);
  reqVid = {
    id: req.params.id
  }
  if(setSession(req, res)){
    getVideoByIdAndState(reqVid.id, req.session.userlogin.iduser)
    .then(function(video) {
      video.url = video.url.replace("watch?v=", "embed/");
      if(video.state == null){
        video.state = 0;
        video.prestate = 0;
      } else {
        video.prestate = video.state;
      }
      return res.render('detailsVid', {video: video, sessUser: sessUser});
    }, function(err) {
      return res.end(err);
      //return res.render('error', err)
    })
  } else {
    getVideoById(reqVid.id)
    .then(function(video) {
      video.url = video.url.replace("watch?v=", "embed/");
      return res.render('detailsVid', {video: video, sessUser: sessUser});
    }, function(err) {
      return res.end(err);
      //return res.render('error', err)
    })
  }
    
}

function getVideoById(id){
  return new Promise(function(resolve, reject) {
    var queryString = "SELECT * FROM videos WHERE idvideo =" + id;
    conn.query(queryString, function (err, rows) {
      if (err) {
        //return res.send(err);
        reject(err);
      } else {
          resolve(rows[0]);
        }
    });
  });
}

function getVideoByIdAndState(id, idcurrentuser){
  return new Promise(function(resolve, reject) {
    var queryString = "SELECT * FROM videos LEFT JOIN statevideo ON videos.idvideo = statevideo.idsvideo AND statevideo.iduser = " + idcurrentuser + " WHERE videos.idvideo =" + id;
    conn.query(queryString, function (err, rows) {
      if (err) {
        //return res.send(err);
        reject(err);
      } else {
          resolve(rows[0]);
        }
    });
  });
}

stateVideoController = function(req, res) {
  //signed_in(req, res);
  reqVid = {
    state: req.body.state,
    idvideo: req.body.idvideo,
    like: req.body.like,
    dislike: req.body.dislike,
    prestate: req.body.prestate,
    //idstate: req.body.id, //idstatevideo
    idcurrentuser: req.session.userlogin.iduser
  }
  console.log(reqVid.prestate + reqVid.state)
  //console.log(reqVid);
  Promise.all([updateOrInsertState(reqVid.state, reqVid.idcurrentuser, reqVid.idvideo), updateLike(reqVid.state, reqVid.prestate, reqVid.idvideo)])
    .then(function(video) {
      console.log(video)
      return res.status(200).json(video);
    }, function(err) {
      console.log("loi promise.all "+err)
    })
}

// CREATE DEFINER=`root`@`localhost` PROCEDURE `updateOrInsertState`(state int, iduser1 int, idvideo int)
// BEGIN
//   IF EXISTS (select * from statevideo where iduser = iduser1 and idsvideo = idvideo) THEN
//     update statevideo set state = state where iduser = iduser1 and idsvideo = idvideo;
//   ELSE 
//     insert into statevideo (iduser, idsvideo, state) values (iduser1, idvideo, state);
//   END IF;
// END

function updateOrInsertState(state, iduser, idvideo){
  return new Promise(function(resolve, reject) {
    var queryString = "CALL updateOrInsertState('" + state + "','" + iduser + "','" + idvideo + "')";
    //var queryString = "SELECT * FROM statevideo";
    conn.query(queryString, function (err, rows) {
      if (err) {
        //return res.send(err);
        reject(err);
      } else {
          resolve(rows);
        }
    });
  });
}

function updateLike(state, prestate, idvideo){
  return new Promise(function(resolve, reject) {
    var queryString;

    if(state == 0 && prestate == 1){
      queryString = "UPDATE `videos` SET `like` = `like`-1 WHERE `idvideo` =" + idvideo;
    }

    if(state == 1 && prestate == 2){
      queryString = "UPDATE `videos` SET `like` = `like`+1, `dislike` = `dislike`-1 WHERE `idvideo` =" + idvideo;
    }

    if(state == 0 && prestate == 2){
      queryString = "UPDATE `videos` SET `dislike` = `dislike`-1 WHERE `idvideo` =" + idvideo;
    }

    if(state == 2 && prestate == 1){
      queryString = "UPDATE `videos` SET `like` = `like`-1, `dislike` = `dislike`+1 WHERE `idvideo` =" + idvideo;
    }

    if(state == 1 && prestate == 0){
      queryString = "UPDATE `videos` SET `like` = `like`+1 WHERE `idvideo` =" + idvideo;
    }

    if(state == 2 && prestate == 0){
      queryString = "UPDATE `videos` SET `dislike` = `dislike`+1 WHERE `idvideo` =" + idvideo;
    }

    conn.query(queryString, function (err, rows) {
      console.log(queryString);
      if (err) {
        //return res.send(err);
        reject(err);
      } else {
          resolve(rows);
        }
    });
  });
}

renderSearchVideoController = function(req, res) {

}

searchVideoController = function(req, res) {
  reqVid = {
    title: req.params.title
  }
  console.log(reqVid.title)
  searchVideobyName(reqVid.title)
    .then(function(videos) {
      //console.log(videos);
      return res.render('searchVid', {videos: videos});
    }, function(err) {
      console.log(err)
      //return res.render('error', {err: error})
    })
}

function searchVideobyName(name){
  return new Promise(function(resolve, reject) {
    var queryString = "SELECT * FROM videos WHERE title like '%" + name + "%'";
    console.log(queryString)
    conn.query(queryString, function (err, rows) {
      if (err) {
        //return res.send(err);
        console.log('loi search vid')
        reject(err);
      } else {
          console.log(rows);
          resolve(rows);
        }
    });
  }); 
}

renderIndexController = function(req, res) {
  setSession(req, res);
  getAllVideo()
    .then(function(videos) {
      //console.log(videos);
      console.log('id session '+ sessUser.iduser) 
      return res.render('index', {videos: videos, sessUser: sessUser.iduser});
    }, function(err) {
      console.log(err)
      //return res.render('error', {err: error})
    })
}

function getAllVideo(){
  return new Promise(function(resolve, reject) {
    var queryString = "SELECT * FROM videos";
    conn.query(queryString, function (err, rows) {
      if (err) {
        //return res.send(err);
        reject(err);
      } else {
          resolve(rows);
        }
    });
  }); 
}

function setSession(req, res) {
  if(req.session.userlogin){
    console.log('da log')   
    sessUser.iduser = req.session.userlogin.iduser;
    sessUser.username = req.session.userlogin.username;
    return true
  } else {
    console.log('chua log') 
    sessUser.iduser = 0;
    return false;
  }
}

chatBoxController = function(req, res){
  setSession(req, res);
  if(sessUser.iduser === 0){
    reqChat = {
      name: 'user-'+ Math.floor((Math.random() * 100000)),
      text: req.body.text      
    };
  } else {
    reqChat = {
      name: req.session.userlogin.username,
      text: req.body.text      
    };
  }
  console.log(reqChat);
  var idvideo = req.body.idvideo;
  refIdchat = refUser.child(idvideo);
  refIdchat.push(reqChat).then(function(chat){
    return res.status(200).json(reqChat);
  }, function(err){
    console.log(err);
  }) 
}

module.exports = {
  renderIndexController: renderIndexController,
  renderPostVideoController: renderPostVideoController,
  postVideoController: postVideoController,
  detailsVideoController: detailsVideoController,
  stateVideoController: stateVideoController,
  renderSearchVideoController: renderSearchVideoController,
  searchVideoController: searchVideoController,
  chatBoxController: chatBoxController
  // renderEditUserController: renderEditUserController,
  // editUserController: editUserController,
  // deleteUserController: deleteUserController,
  // searchUserController: searchUserController,
}