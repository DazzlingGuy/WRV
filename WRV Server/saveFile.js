var sqlite3 = require('sqlite3');
var fs = require('fs');
var path = require('path')

// var dataBase = './serverDB/server.db'
var dataBase = './serverDB/serverTest.db'

var maxID = -1
var templateCellFormats = "templateCellFormats"
var templateRowContent = "templateRowContent"
var templateCellContent = "templateCellContent"
var GRPfiles = "GRPfiles"
var allTable = [GRPfiles, templateCellFormats, templateRowContent, templateCellContent]

var db = new sqlite3.Database(path.join(__dirname, dataBase), function (err) {
  console.log(err)
  //在这里初始化maxID，最后新增记录，保证ItemID的唯一
  allTable.forEach(element => {
    db.all("select max(ItemID) from " + element, function (err, res) {
      if (!err) {
        res.forEach(element => {
          var max = +element['max(ItemID)'];
          if (max > maxID) {
            maxID = max
          }
        });
      }
    });
  })
});


function getNewItemIDForInsertRecord() {
  maxID = maxID + 1;
  return maxID;
}


function InserttemplateCellFormatsRecord(strjsonData, nfileID) {

  strjsonData.forEach(CellFormats => {

    var Newid = getNewItemIDForInsertRecord().toString()
    var sql = "insert into templateCellFormats(ItemID,fileID,fontIsBold,bottomMargin,leftLineWidth,rightLineWidth,fontName,fontSize,bottomLineWidth,\
      topLineWidth, topMargin,vertAlignment,fontColor,rightMargin,horzAlignment,fontIsUnderLine,fontIsItalic,leftMargin)VALUES (" + Newid + "," + nfileID + "," +
      CellFormats.FontIsBold + "," + CellFormats.BottomMargin + "," + CellFormats.LeftLineWidth + "," + CellFormats.RightLineWidth + "," + CellFormats.FontName + "," + CellFormats.FontSize + "," + CellFormats.BottomLineWidth + "," + CellFormats.TopLineWidth + "," + CellFormats.TopMargin + "," + CellFormats.VertAlignment + "," + CellFormats.FontColor + "," +
      CellFormats.RightMargin + "," + CellFormats.HorzAlignment + "," + CellFormats.FontIsUnderLine + "," + CellFormats.FontIsItalic + "," + CellFormats.LeftMargin + ")"
    sql.replace("false", 0)
    sql.replace("true", 1)
    db.run(sql)
  })
}

function templateCellFormatsDATA(fileID, callback) {
  db.all("select * from templateCellContent where fileID=" + fileID, function (err, res) {
    var array = new Array()
    res.forEach(element => {

      array.push({
        "Id": element.Id,
        "FontIsBold": element.FontIsBold,
        "BottomMargin": element.BottomMargin,
        "LeftLineWidth": element.LeftLineWidth,
        "IRightLineWidthd": element.RightLineWidth,
        "RightMargin": element.RightMargin,
        "HorzAlignment": element.HorzAlignment,
        "FontIsUnderLine": element.FontIsUnderLine,
        "FontIsItalic": element.FontIsItalic,
        "LeftMargin": element.LeftMargin,
        "FontName": element.FontName,
        "FontSize": element.FontSize,
        "BottomLineWidth": element.BottomLineWidth,
        "TopLineWidth": element.TopLineWidth,
        "TopMargin": element.TopMargin,
        "VertAlignment": element.VertAlignment,
        "FontColor": element.FontColor,
      })
    });
    var data = {
      "CellFormats": array
    }
    callback(data)
  });
}



function templateRowContentDATA(fileID, callback) {
  db.all("select * from templateRowContent where fileID=" + fileID, function (err, res) {

  });
}

function InsertGRPfilesRecord(strjsonData,callback) {
  var ItemID = getNewItemIDForInsertRecord().toString();
  var fileName = strjsonData.fileName
  var adjustTime = strjsonData.adjustTime
  var sql = "insert into GRPfiles(ItemID,fileName,adjustTime) VALUES (" + ItemID + "," + `'${fileName}'` + "," + `'${adjustTime}'` + ")"
  db.run(sql)
  callback(ItemID)
  return ItemID;
}

function InserttemplateCellContentRecord(strjsonData, nfileID, RowID) {

  ItemID = getNewItemIDForInsertRecord().toString()
  var canEdit = 0
  if (strjsonData.CanEdit == "true") {
    canEdit = 1;
  }

  var sql = "insert into templateCellContent(ItemID,fileID,Row,Col,CellFormatId,value,CanEdit,ColSpan,DataType,RowSpan\
    ) VALUES (" + ItemID + "," + nfileID + "," + RowID + "," + strjsonData.Col + "," + strjsonData.CellFormat + "," + "'" + strjsonData.Value + "'" + "," + canEdit + "," + strjsonData.ColSpan + "," + strjsonData.DataType + "," + strjsonData.RowSpan + ")"
  sql.replace("false", 0)
  sql.replace("true", 1)
  db.run(sql)
}

function InserttemplateRowContentRecord(strjsonData, nfileID) {
  var ItemID = -1;
  strjsonData.forEach(rowData => {
    ItemID = getNewItemIDForInsertRecord().toString()
    var sql = "insert into templateRowContent(ItemID,fileID,row) VALUES (" + ItemID + "," + nfileID + "," + rowData.RowID.toString() + ")"
    db.run(sql)
    var cells = rowData.RowData;
    cells.forEach(cellData => {
      InserttemplateCellContentRecord(cellData, nfileID, ItemID)
    });
  });
}

exports.getAllfiles = function (callback) {
  var xx = db.all("select * from GRPfiles")
  var data = ""
  db.all("select * from GRPfiles", function (err, res) {
    var myArray = new Array()
    if (!err) {
      res.forEach(element => {
        myArray.push({
          "index": element.ItemID,
          "name": element.fileName,
          "time": element.adjustTime
        })
      });
      data = JSON.stringify(myArray);
      callback(data)
    }
  });
}

// getAllContent("1",function(data){
//   var xx = data;
// })

// function getAllContent(fileName,callback) {
//   var data = ""
//   db.all("select * from GRPfiles where fileName="+fileName,function(err,res){
//     var fileID = res[0].ItemID
//     var CellFormats = "";
//     templateCellFormatsDATA(fileID,function(data){
//       CellFormats = JSON.stringify(data);
//     })
//     callback(data)  
//   }); 
// }



exports.deletefile = function (index) {
  db.all(`select * from GRPfiles where ItemID = ${index}`, function (err, res) {
    var sql1 = `DELETE FROM templateCellContent WHERE fileID = ${index}`
    var sql2 = `DELETE FROM templateCellFormats WHERE fileID = ${index}`
    var sql3 = `DELETE FROM templateRowContent WHERE fileID = ${index}`
    var sql4 = `DELETE FROM GRPfiles WHERE ItemID = ${index}`
    db.run(sql1)
    db.run(sql2)
    db.run(sql3)
    db.run(sql4)
  })
}

function getAllcells() {
  db.all("select * from templateCellContent", function (err, res) {
    var myArray = new Array()
    if (!err) {
      res.forEach(element => {
        var array = new Array()
        array.push({
          "rowID": element.rowID,
          "col": element.col,
          "cellFormat": element.cellFormat,
          "value": element.value
        })
        var cell = {
          "cells": array
        }
        var row = {
          "cells": element.rowID
        }
        myArray.push({
          "cells": element.rowID
        }, {
          "cells": array
        })
      });
    }
    var data = JSON.stringify(myArray);
    return data;
  });
}

function updateCellValue() {
  var JSONData = JSON.parse(data.toString())
  var NewValue = ""
  var conditions = ""
  var x = JSON.parse(data.toString(), function (key, value) {
    if (key != "0" && key != "") {
      if (key == "value") {
        NewValue = ",'" + value + "'";
      } else {
        var condition = key + "=" + value;
        conditions += condition;
      }
    }
  })

  var sql = "UPDATE templateCellContent SET value = " + NewValue + "WHERE" + conditions
  db.run(sql)
}

exports.uploadFiles = function (post) {
  var FILEID = "";

  if (post.File) {
    FILEID = InsertGRPfilesRecord(post.File,function(id){
      var data = {"CellFormats":post.CellFormats,"PageContent":post.PageContent}
      let str = JSON.stringify(data)
       
      fs.writeFile("./JsonData/"+id.toString()+'.json',str,function(){})
    })

  } else {
    return
  }

  for (var item in post) {
    if ("CellFormats" === item) {
      InserttemplateCellFormatsRecord(post.CellFormats, FILEID)
    } else if ("PageContent" === item) {
      InserttemplateRowContentRecord(post.PageContent, FILEID)
    }
  }
}

exports.getFileContent = function (id,callback) {
  fs.exists("./JsonData/"+id.toString()+'.json',function(exists){
    if(exists){
      var data = fs.readFileSync("./JsonData/"+id.toString()+'.json');
      callback(data.toString())
    }
    if(!exists){
      console.log("文件不存在")
    }
    })
}

//db.close()