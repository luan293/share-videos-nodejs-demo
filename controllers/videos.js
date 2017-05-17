var userController = require('./users');
var refUser = firebase.database().ref('chat-log');
var randomname;  //random username chat khi không login
//var sessUser = {};
renderPostVideoController = function(req, res) {
  //signed_in(req, res);
  userController.checkLogin(req, res); // return về trang login khi chưa login
  setSession(req, res);                // set session để view sử dụng (check thanh menu login/signin... ở layout)
                                       // chưa tìm đc cách khác   
  return res.render('postVideo', {sessUser: sessUser});
}

postVideoController = function(req, res) {
  //signed_in(req, res);
  userController.checkLogin(req, res); 
  var reqVid = {
    title: req.body.title,
    url: req.body.url,
    iduser: req.session.userlogin.iduser
  };

  if(!checkUrlYoutube(reqVid.url)) {        //check url
    return res.render('postVideo', {validPostUrl: 'link không hợp lệ'})
  } else if(reqVid.title == "") {           //check title
    return res.render('postVideo', {validPostTitle: 'Title không được trống'})
  } else {
    //var queryString = "INSERT INTO videos (idauthor, title, url) VALUES ('" + reqVid.iduser + "','" + reqVid.title + "','" + reqVid.url + "')";
    var queryString = `INSERT INTO videos (idauthor, title, url) VALUES ('${reqVid.iduser}', '${reqVid.title}', '${reqVid.url}')`;
    conn.query(queryString, function (err, rows) {
      if(err) {
        return res.render('postVideo', {validPostUrl: 'link không hợp lệ'})
      } else { 
        return res.redirect('index');
      }
    });
  }
}

// check url
function checkUrlYoutube(url) {
  if(url.search('https://www.youtube.com/watch?') != 0) {
    return false;
  } else {
    return true;
  }
}

detailsVideoController = function(req, res) {
  //signed_in(req, res);
  reqVid = {
    id: req.params.id
  };

  randomname = 'user-'+ Math.floor((Math.random() * 100000));     //random username chat khi không login
  
  if(setSession(req, res)) {          // check user có login hay không  
    getVideoByIdAndState(reqVid.id, req.session.userlogin.iduser)
    .then(function(video) {
      video.url = video.url.replace("watch?v=", "embed/");
      if(video.state == null){        // lần đầu chưa like/dislike => state = null
        video.state = 0;
        video.prestate = 0;
      } else {
        video.prestate = video.state;
      }
      return res.render('detailsVid', {video: video, sessUser: sessUser});
    }, function(err) {
      return res.end(err);
      //return res.render('error', err)
    });
  } else {
    getVideoById(reqVid.id)
    .then(function(video) {
      video.state = -1;
      video.prestate = -1;
      video.url = video.url.replace("watch?v=", "embed/");
      return res.render('detailsVid', {video: video, sessUser: sessUser});
    }, function(err) {
      return res.end(err);
      //return res.render('error', err)
    })
  }
    
}

function getVideoById(id) {
  return new Promise(function(resolve, reject) {
    //var queryString = "SELECT * FROM videos WHERE idvideo =" + id;
    var queryString = `SELECT * FROM videos WHERE idvideo = ${id}`;
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

// left join 2 bảng videos và statevideo để lấy thông tin like/dislike của user hiện tại(idcurrentuser) đối với video hiện tại(id)
function getVideoByIdAndState(id, idcurrentuser) {
  return new Promise(function(resolve, reject) {
    //var queryString = "SELECT * FROM videos LEFT JOIN statevideo ON videos.idvideo = statevideo.idsvideo AND statevideo.iduser = " + idcurrentuser + " WHERE videos.idvideo =" + id;
    var queryString = `SELECT * FROM videos LEFT JOIN statevideo ON videos.idvideo = statevideo.idsvideo AND statevideo.iduser = ${idcurrentuser} WHERE videos.idvideo = ${id}`;
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

//update/insert bảng state và update cột like/dislike bảng videos
stateVideoController = function(req, res) {
  //signed_in(req, res);
  reqVid = {
    state: req.body.state,
    idvideo: req.body.idvideo,
    like: req.body.like,
    dislike: req.body.dislike,
    prestate: req.body.prestate,
    idcurrentuser: req.session.userlogin.iduser
  };

  Promise.all([updateOrInsertState(reqVid.state, reqVid.idcurrentuser, reqVid.idvideo), updateLike(reqVid.state, reqVid.prestate, reqVid.idvideo)])
    .then(function(video) {
      return res.status(200).json(video);  //ajax
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
function updateOrInsertState(state, iduser, idvideo) {
  return new Promise(function(resolve, reject) {
    //var queryString = "CALL updateOrInsertState('" + state + "','" + iduser + "','" + idvideo + "')";
    var queryString = `CALL updateOrInsertState(${state}, ${iduser}, ${idvideo})`;
    conn.query(queryString, function(err, rows) {
      if (err) {
        //return res.send(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function updateLike(state, prestate, idvideo) {
  return new Promise(function(resolve, reject) {
    var queryString;

    if(state == 0 && prestate == 1) {
      queryString = "UPDATE `videos` SET `like` = `like`-1 WHERE `idvideo` =" + idvideo;
      //queryString = `UPDATE videos SET like = like-1 WHERE idvideo = ${idvideo}`;
    }

    if(state == 1 && prestate == 2) {
      queryString = "UPDATE `videos` SET `like` = `like`+1, `dislike` = `dislike`-1 WHERE `idvideo` =" + idvideo;
      //queryString = `UPDATE videos SET like = like+1, dislike = dislike-1 WHERE idvideo = ${idvideo}`;
    }

    if(state == 0 && prestate == 2) {
      queryString = "UPDATE `videos` SET `dislike` = `dislike`-1 WHERE `idvideo` =" + idvideo;
      //queryString = `UPDATE videos SET dislike = dislike-1 WHERE idvideo = ${idvideo}`;
    }

    if(state == 2 && prestate == 1) {
      queryString = "UPDATE `videos` SET `like` = `like`-1, `dislike` = `dislike`+1 WHERE `idvideo` =" + idvideo;
      //queryString = `UPDATE videos SET like = like-1, dislike = dislike+1 WHERE idvideo = ${idvideo}`;
    }

    if(state == 1 && prestate == 0) {
      queryString = "UPDATE `videos` SET `like` = `like`+1 WHERE `idvideo` =" + idvideo;
      //queryString = `UPDATE videos SET like = like+1 WHERE idvideo = ${idvideo}`;
    }

    if(state == 2 && prestate == 0) {
      queryString = "UPDATE `videos` SET `dislike` = `dislike`+1 WHERE `idvideo` =" + idvideo;
    }
    //console.log(queryString)
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

// renderSearchVideoController = function(req, res) {

// }

// searchVideoController = function(req, res) {
//   reqVid = {
//     title: req.params.title
//   };
//   searchVideobyName(reqVid.title)
//     .then(function(videos) {
//       //console.log(videos);
//       return res.render('searchVid', {videos: videos});
//     }, function(err) {
//       console.log(err);
//       //return res.render('error', {err: error})
//     });
// }

// function searchVideobyName(name) {
//   return new Promise(function(resolve, reject) {
//     //var queryString = "SELECT * FROM videos WHERE title like '%" + name + "%'";
//     var queryString = `SELECT * FROM videos WHERE title like %${name}%`;
//     console.log(queryString)
//     conn.query(queryString, function(err, rows) {
//       if (err) {
//         //return res.send(err);
//         console.log('loi search vid')
//         reject(err);
//       } else {        
//         resolve(rows);
//       }
//     });
//   }); 
// }

renderIndexController = function(req, res) {
  setSession(req, res);
  getAllVideo()
    .then(function(videos) {
      //console.log(videos);
      return res.render('index', {videos: videos, sessUser: sessUser});
    }, function(err) {
      console.log(err)
      //return res.render('error', {err: error})
    })
}

function getAllVideo(){
  return new Promise(function(resolve, reject) {
    var queryString = "SELECT * FROM videos";
    conn.query(queryString, function (err, rows) {
      if(err) {
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
    sessUser.iduser = req.session.userlogin.iduser;
    sessUser.username = req.session.userlogin.username;
    return true;
  } else {
    sessUser.iduser = 0;
    return false;
  }
}

chatBoxController = function(req, res) {
  setSession(req, res);
  if(sessUser.iduser === 0) { //chưa log in
    reqChat = {
      name: randomname,
      text: req.body.text      
    };
  } else {
    reqChat = {
      name: req.session.userlogin.username,
      text: req.body.text      
    };
  }
  var idvideo = req.body.idvideo;
  refIdchat = refUser.child(idvideo);
  refIdchat.push(reqChat).then(function(chat) {
    return res.status(200).json(reqChat);
  }, function(err) {
    console.log(err);
  });
}

module.exports = {
  renderIndexController: renderIndexController,
  renderPostVideoController: renderPostVideoController,
  postVideoController: postVideoController,
  detailsVideoController: detailsVideoController,
  stateVideoController: stateVideoController,
  //renderSearchVideoController: renderSearchVideoController,
  //searchVideoController: searchVideoController,
  chatBoxController: chatBoxController
}