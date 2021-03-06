// Generated by CoffeeScript 1.9.1
var Okada, Room, fs, moment, parseDouyuRoomInfo, parseZhanqiRoomInfo, request, roomsData;

request = require('request');

fs = require('fs');

moment = require('moment');

roomsData = [];

Room = (function() {
  function Room(roomInfo, url1) {
    this.url = url1;
    this.show_status = 0;
    this.room_name = '';
    this.show_time = 0;
    this.live_snapshot = '';
    this.owner_avatar = '';
    this.show_details = '';
    this.fans = 0;
    this.online = 0;
    this.room_url = '';
    this.room_id = roomInfo.room_id, this.always_show = roomInfo.always_show, this.disabled = roomInfo.disabled, this.live_provider = roomInfo.live_provider;
  }

  Room.prototype.duration = function() {
    var timestamp;
    timestamp = parseInt(this.show_time);
    return moment.unix(timestamp).locale('zh-cn').fromNow(true);
  };

  return Room;

})();

parseDouyuRoomInfo = function(jsonText, room) {
  var e, obj;
  try {
    obj = JSON.parse(jsonText).data;
    room.show_status = parseInt(obj.show_status);
    room.room_name = obj.room_name;
    room.show_time = obj.show_time;
    room.live_snapshot = obj.room_src;
    room.owner_avatar = obj.owner_avatar;
    room.show_details = obj.show_details;
    room.fans = parseInt(obj.fans);
    room.online = obj.online;
    return room.room_url = obj.url;
  } catch (_error) {
    e = _error;
    console.log("ERROR: parse room info");
    console.log(room.url);
    console.log(jsonText);
    return console.log("------------");
  }
};

parseZhanqiRoomInfo = function(jsonText, room) {
  var e, obj;
  try {
    obj = JSON.parse(jsonText).data;
    room.show_status = parseInt(obj.status);
    if (room.show_status === 0) {
      room.show_status = 2;
    } else {
      room.show_status = 1;
    }
    room.room_name = obj.title;
    room.show_time = obj.liveTime;
    room.live_snapshot = obj.bpic;
    room.owner_avatar = obj.avatar;
    room.fans = obj.follows;
    room.online = parseInt(obj.online);
    return room.room_url = obj.url;
  } catch (_error) {
    e = _error;
    console.log("ERROR: parse room info");
    console.log(room.url);
    console.log(jsonText);
    return console.log("------------");
  }
};

Okada = (function() {
  function Okada(miki1) {
    this.miki = miki1;
  }

  Okada.prototype.startMonitor = function() {
    var checker, i, len, miki, r, ref, results, room, url;
    miki = this.miki;
    checker = function(room) {
      var hostname, options;
      switch (room.live_provider) {
        case 'douyu':
          hostname = 'www.douyutv.com';
          break;
        case 'zhanqi':
          hostname = 'www.zhanqi.tv';
      }
      options = miki.createRequestOptions(room.url, hostname);
      return request(options, function(err, res, body) {
        if (err != null) {
          console.log(room.url);
          console.log(err);
        }
        switch (room.live_provider) {
          case "douyu":
            parseDouyuRoomInfo(body, room);
            if (room.live_snapshot != null) {
              room.live_snapshot = room.live_snapshot.replace(miki.config.douyuWebPicUrl, '');
              room.owner_avatar = room.owner_avatar.replace(miki.config.douyuAvatarAPI, '\/');
              miki.updateRoom(room);
            } else {
              console.log("douyu live_snapshot empty, dont save");
              console.log(JSON.stringify(room));
            }
            break;
          case "zhanqi":
            parseZhanqiRoomInfo(body, room);
            room.live_snapshot = room.live_snapshot.replace(miki.config.zhanqiWebPicUrl, '');
            room.owner_avatar = room.owner_avatar.replace(miki.config.zhanqiAvatarAPI, '');
            miki.updateRoom(room);
            break;
          default:
            console.error("ERROR: cant parse live_provider");
        }
        return setTimeout((function() {
          return function() {
            return checker(room);
          };
        })(), miki.config.roomCheckInterval);
      });
    };
    ref = this.miki.config.roomInfo;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      r = ref[i];
      if (r.disabled) {
        continue;
      }
      switch (r.live_provider) {
        case "douyu":
          url = this.miki.config.douyuRoomAPI + r.room_id;
          break;
        case "zhanqi":
          url = this.miki.config.zhanqiRoomAPI + r.room_id + ".json";
      }
      room = new Room(r, url);
      results.push(checker(room));
    }
    return results;
  };

  return Okada;

})();

module.exports = Okada;
