var userController = require('./users');

renderPostVideoController = function(req, res) {
  //signed_in(req, res);
  userController.checkLogin(req, res);
  return res.render('postVideo');
}

postVideoController = function(req, res) {
  //signed_in(req, res);
  userController.checkLogin(req, res);
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
  getVideoById(reqVid.id, req.session.userlogin.iduser)
    .then(function(video) {
      video.url = video.url.replace("watch?v=", "embed/");
      if(video.state == null){
        video.state = 0;
        video.prestate = 0;
      } else {
        video.prestate = video.state;
      }
      return res.render('detailsVid', {video: video});
    }, function(err) {
      return res.render('error', err)
    })
}

function getVideoById(id, idcurrentuser){
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
      console.log('pass promise all')
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
          resolve(rows[0]);
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
          resolve(rows[0]);
        }
    });
  });
}

searchVideoController = function(req, res) {
  reqVid = {
    title: req.params.title
  }
  searchVideobyName(reqVid.title)
    .then(function(video) {
      return res.render('detailsVid', {video: video});
    }, function(err) {
      return res.render('error', err)
    })
}

function searchVideobyName(name){
  return new Promise(function(resolve, reject) {
    var queryString = "SELECT * FROM videos WHERE videos.idvideo like %" + id + "%";
    conn.query(queryString, function (err, rows) {
      if (err) {
        //return res.send(err);
        reject(err);
      } else {
          //console.log(rows);
          resolve(rows);
        }
    });
  }); 
}

module.exports = {
  renderPostVideoController: renderPostVideoController,
  postVideoController: postVideoController,
  detailsVideoController: detailsVideoController,
  stateVideoController: stateVideoController,
  searchVideoController: searchVideoController
  // renderEditUserController: renderEditUserController,
  // editUserController: editUserController,
  // deleteUserController: deleteUserController,
  // searchUserController: searchUserController,
}