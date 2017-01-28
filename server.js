'use strict';

var express = require('express');
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var app = express();
var bodyParser = require('body-parser');
var _ = require('lodash');
var stockListO=require('./app/stockListO');
require('dotenv').load();

global.lastdate=Date.now();
//*
var mongoURL = process.env.MONGODB_URI;


var ERRCODE={
  "success":0,             // 无错误
  "codeErr":1,           // 股票代码无效
  "storeErr":2          // 数据未存储
  /*
  "":3,           //
  "":4,           //
  "":5,           //
  //*/
}

app.set('port', (process.env.PORT || 80));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 设置模板目录和处理技术
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/',  function(request, response) {
  	response.render('pages/index');
});

app.get('/getAinfo/:stid',function(request,response){
  var stid=request.params.stid;
  response.json(_getAinfo(stid));
});

var _getAinfo=function(stid){
  var rt={err:0,info:[]};
  
   if(stockListO.findAcode(stid)){ // 检查是否有效
        rt.info.push([stid,stockListO.getAcode(stid)]);
    }else{
       rt.err=ERRCODE.codeErr;
       rt.info.push([stid,stid]);
    }
     return rt;
}

app.get('/add/:stid',function(request,response){ // 添加一个股票到监控列表中
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
  // request.params.stid
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    updateAdd(db, function(rt) {
        db.close();
        response.json(rt);
    }, {stid:request.params.stid});
  });
  //response.end(JSON.stringify(['000001','601666']));
});

app.get('/remove/:stid',function(request,response){ // 从监控列表中删除一个股票
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
  // request.params.stid 
  // 获取上次更新时间及当前列表
  // 判断 stid是否存在于列表中，是则删除更新数据和更新时间，返回 最后更新时间
  // 已经不在， 返回 上次更新时间
    MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    updateDel(db, function(rt) {
        db.close();
        response.json(rt);
    }, {stid:request.params.stid});
  });
});

app.get('/list',  function(request, response) { // 获取需要监控的股票列表
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
  // 返回上次更新时间以及列表
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    findList(db, function(rt) {
        db.close();
        response.json(rt);
    });
  });
});

app.get('/ping',  function(request, response) { // 获取列表最后更新时间数据，用于检查是否更新
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
 var now=(new Date(Date.now())).getTime();
 var today=new Date(now);
 var pYearDay=new Date(now-1000*3600*24*365);
 var tDStr= today.getFullYear()  + (today.getMonth() < 10 ? '0' + (today.getMonth()+1) : (today.getMonth()+1)) + (today.getDate() < 10 ? '0' + today.getDate() : today.getDate()) ;
 var pYStr= pYearDay.getFullYear()  + (pYearDay.getMonth() < 10 ? '0' + (pYearDay.getMonth()+1) : (pYearDay.getMonth()+1)) + (pYearDay.getDate() < 10 ? '0' + pYearDay.getDate() : pYearDay.getDate()) ;
 response.end(JSON.stringify({"lastdate":global.lastdate,"toDay":tDStr,"preYearDay":pYStr}));
});
 
var findList = function(db, callback, inobj) {
  // 获取监控列表
  var lastdate=Date.now();
  var rt={list:[],lastdate:lastdate,err:0};
  var flag=true;
    db.collection('watchstocks').findOne( { "_id": "5887230d9bf6d00011c32a82" },function(err,doc){
      assert.equal(err, null);
      if (doc != null) { // 有数据了
         flag=false;
         rt.list=doc.list;  //获取旧的情况
         global.lastdate=rt.lastdate=doc.lastdate;
         callback(rt);
      }else{
        // 没有数据
        rt.err=ERRCODE.storeErr; // 
        callback(rt);
      }
    });
};
// 删除/更新记录
var updateDel =function(db, callback, inData) {

    // 判断stid是否已经在列表中，是则删除更新，并返回相关消息消息 ，并返回最后更新列表时间
      // 获取上次更新时间及当前列表


  // 不在，则 判断是否是有效 stid，是则添加进列表 ，返回 添加成功消息，并返回最后更新列表时间
     // 通过 XXX 判断stid有效

  // 不是有效 stid ， 返回 stid错误消息，并返回最后更新列表时间
      // 通过 XXX 判断stid无效
  var lastdate=Date.now();
  var rt={list:[],lastdate:lastdate,err:0};
  var flag=true;
  db.collection('watchstocks').findOne( { "_id":"5887230d9bf6d00011c32a82" }, function(err,doc){
        //assert.equal(err, null);
      if (doc != null) {
         flag=false;
         rt.list=doc.list;  //获取旧的情况
         lastdate=doc.lastdate; //获取旧更新时间
      }
   global.lastdate=rt.lastdate=lastdate;
   var s=_.indexOf(rt.list, inData.stid)
   if( s<0 ){ //已经没有那个股票 直接返回消息
     rt.err=ERRCODE.success; // 相当于已经删除 
     callback(rt);
   }else{
     // 有那个股票，需要删除更新
     rt.list.splice(s,1);
     rt.lastdate=Date.now();
     db.collection('watchstocks').updateOne(
              {_id: "5887230d9bf6d00011c32a82"},
            // {_id: new ObjectId(joinData.barID)},
              {
              _id: "5887230d9bf6d00011c32a82",
              "list" : rt.list,
              "lastdate":rt.lastdate
            }, function(err, results) {
              callback(rt);
            });
   }
  });
};
// 插入/更新记录
var updateAdd = function(db, callback, inData) {

    // 判断stid是否已经在列表中，是则返回 已在消息 ，并返回最后更新列表时间
      // 获取上次更新时间及当前列表


  // 不在，则 判断是否是有效 stid，是则添加进列表 ，返回 添加成功消息，并返回最后更新列表时间
     // 通过 XXX 判断stid有效

  // 不是有效 stid ， 返回 stid错误消息，并返回最后更新列表时间
      // 通过 XXX 判断stid无效
  var lastdate=Date.now();
  var rt={list:[],lastdate:lastdate,err:0};
  var flag=true;
  db.collection('watchstocks').findOne( { "_id":"5887230d9bf6d00011c32a82" }, function(err,doc){
        //assert.equal(err, null);
      if (doc != null) {
         flag=false;
         rt.list=doc.list;  //获取旧的情况
         lastdate=doc.lastdate; //获取旧更新时间
      }
   global.lastdate=rt.lastdate=lastdate;
   var s=_.indexOf(rt.list, inData.stid)
   if( s<0 ){ //没有有那个股票
     // 判断股票是否可以插入
     if(stockListO.findAcode(inData.stid)){
       // 可以插入
       rt.list.push(inData.stid)
       if(flag){ // 插入
            rt.lastdate=Date.now();
            db.collection('watchstocks').insertOne( {
              _id: "5887230d9bf6d00011c32a82",
              "list" : rt.list,
              "lastdate":rt.lastdate
            }, function(err, results) {
              callback(rt);
            });
        }else{  // 更新
          db.collection('watchstocks').updateOne(
              {_id: "5887230d9bf6d00011c32a82"},
            // {_id: new ObjectId(joinData.barID)},
              {
              _id: "5887230d9bf6d00011c32a82",
              "list" : rt.list,
              "lastdate":rt.lastdate
            }, function(err, results) {
              callback(rt);
            });
        }
     }else{
       // 不可以插入
       rt.err=ERRCODE.codeErr; // 股票代码错误
       callback(rt);
     }
   }else{
     // 已经有这个股票了，直接更新即可
     rt.err=ERRCODE.success; // 相当于已经插入
     callback(rt);
   }
  });
};


app.listen(app.get('port'), function() {
    console.log('程序监听端口为', app.get('port'));
});
//*/