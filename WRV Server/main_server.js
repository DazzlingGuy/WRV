var http = require('http');
var fs = require('fs');
var url = require('url');
var dataBase = require('./saveFile');
var querystring = require('querystring');


var sqlite3 = require('sqlite3');
//var dataBase = './serverDB/serverTest.db'
var maxID = -1
var templateCellFormats = "templateCellFormats"
var templateRowContent = "templateRowContent"
var templateCellContent = "templateCellContent"
var GRPfiles = "GRPfiles"
var allTable = [GRPfiles, templateCellFormats, templateRowContent, templateCellContent]


//var templateCellFormats = dataBase.templateCellFormats

// 创建服务器
http.createServer(function (req, res) {
   res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
   res.setHeader("Access-Control-Allow-Credentials", "true");
   res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
   res.setHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

   var post = '';

   var object = url.parse(req.url, true);
   var pathname = object.pathname

   if (pathname == "/fileList" || pathname == "/") {
      dataBase.getAllfiles(function (data) {
         res.end(data)
      })
   } else if (pathname == "/delete") {
      var index = object.query.index;
      dataBase.deletefile(index)
   }
   else if (pathname == "/getdata") {
      var index = object.query.index;
      dataBase.getFileContent(index,function (data) {
         res.end(data)
      })
   };

   // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
   req.on('data', function (chunk) {
      post += chunk;
   });

   // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
   req.on('end', function () {
      post = querystring.parse(post);
      for (var item in post) {
         if (req.url == "/upload") {
            var dataJson = JSON.parse(item)
            dataBase.uploadFiles(dataJson);
         } else if (req.url == "modify") {

         }
      }
   });
}).listen(9090);