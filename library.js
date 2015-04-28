'use strict';

var User = module.parent.require('./user');
var Topic = module.parent.require('./topics');
var db = module.parent.require('./database');
var SocketAdmins = module.parent.require('./socket.io/admin');
var SocketPlugins = module.parent.require('./socket.io/plugins');
var socket = module.parent.require('./socket.io');

var calls = {};

  // ONLY CALLS BETWEEN FOLLOWED USERS

  // Sockets
  SocketPlugins.callUser = function (socket, data, callback) {
    // console.log(socket.uid+" is calling to "+data.uid);
    User.isFollowing(data.uid, socket.uid, function(err, isFollowing){
      // Check if called user is following to caller user
      if(isFollowing)
      {
        User.getUserData(socket.uid, function(err, usData){
          socket.in('uid_' + data.uid).emit('plugins.incomingCall.'+data.uid, {uid:socket.uid, username:usData.username, apikey:data.apikey});
          callback(null, null);
        });
      }
      else
      {
        callback("notFollowed",null);
      }
    });
  };

  SocketPlugins.acceptedIncomingCall = function (socket, data, callback) {
    // console.log(socket.uid+" accepted call from "+data.youruid);
    //console.log(data);
    User.getUserData(socket.uid, function(err, usData){
      socket.in('uid_' + data.youruid).emit('plugins.acceptedIncomingCall.'+data.youruid, {peerid:data.peerid, username:usData.username});
    });
  };

module.exports = calls;
