var sqlite3 = require('sqlite3');
var fs = require('fs');
var path = require('path')

var database = './serverDB/server.db'

var max_item_id = -1

var cell_formats_table = 'CellFormats'
var row_content_table = 'RowContent'
var cell_content_table = 'CellContent'
var grp_files_table = 'GRPFiles'

var data_base_table = [grp_files_table, cell_formats_table, row_content_table, cell_content_table]

var db = new sqlite3.Database(path.join(__dirname, database), function (err) {
  console.log(err)
  data_base_table.forEach(element => {
    db.all(`SELECT MAX(ItemID) FROM ${element}`, function (err, res) {
      if (!err) {
        res.forEach(element => {
          var id = +element['MAX(ItemID)'];
          if (id > max_item_id) {
            max_item_id = id
          }
        });
      }
    });
  })
});


function getItemID() {
  max_item_id += 1;
  return max_item_id;
}


function insertCellFormatsRecord(data, fileID) {
  data.forEach(CellFormats => {
    var sql = `INSERT INTO ${cell_formats_table}(ItemID, FileID, FontIsBold, BottomMargin, LeftLineWidth, RightLineWidth, FontName, FontSize, BottomLineWidth,\
      TopLineWidth, TopMargin, VertAlignment, FontColor, RightMargin, HorzAlignment, FontIsUnderLine, FontIsItalic, LeftMargin)\
      VALUES(${getItemID()}, ${fileID}, ${CellFormats.FontIsBold}, ${CellFormats.BottomMargin}, ${CellFormats.LeftLineWidth}, ${CellFormats.RightLineWidth}, ${CellFormats.FontName},
      ${CellFormats.FontSize}, ${CellFormats.BottomLineWidth}, ${CellFormats.TopLineWidth}, ${CellFormats.TopMargin}, ${CellFormats.VertAlignment}, ${CellFormats.FontColor},
      ${CellFormats.RightMargin}, ${CellFormats.HorzAlignment}, ${CellFormats.FontIsUnderLine}, ${CellFormats.FontIsItalic}, ${CellFormats.LeftMargin})`

    sql.replace('false', 0)
    sql.replace('true', 1)

    db.run(sql)
  })
}

function insertGRPFilesRecord(data, callback) {
  var itemID = getItemID().toString();
  var fileName = data.fileName
  var adjustTime = data.adjustTime

  var sql = `INSERT INTO ${grp_files_table}(ItemID, FileName, AdjustTime) VALUES(${itemID}, '${fileName}', '${adjustTime}')`

  db.run(sql)

  callback(itemID)

  return itemID;
}

function insertCellContentRecord(data, fileID, RowID) {
  itemID = getItemID().toString()

  var sql = `INSERT INTO ${cell_content_table}(ItemID, FileID, Row, Col, CellFormat, Value, ColSpan, DataType, RowSpan)
  VALUES(${itemID}, ${fileID}, ${RowID}, ${data.Col}, ${data.CellFormat}, '${data.Value}', ${data.ColSpan}, ${data.DataType}, ${data.RowSpan})`

  sql.replace('false', 0)
  sql.replace('true', 1)

  db.run(sql)
}

function insertPageContentRecord(data, fileID, type) {
  data.forEach(rowData => {
    itemID = getItemID().toString()
    var sql = `INSERT INTO ${row_content_table}(ItemID, FileID, Row, Type) VALUES(${itemID}, ${fileID}, ${rowData.RowID.toString()}, ${type})`

    db.run(sql)

    var cells = rowData.RowData;
    cells.forEach(cellData => {
      insertCellContentRecord(cellData, fileID, itemID)
    });
  });
}

var getAllfiles = function (callback) {
  var data = ''
  db.all(`select * from ${grp_files_table}`, function (err, res) {
    var array = new Array()
    if (!err) {
      res.forEach(element => {
        array.push({
          index: element.ItemID,
          name: element.FileName,
          time: element.AdjustTime
        })
      });
      data = JSON.stringify(array);
      callback(data)
    }
  });
}

exports.getAllfiles = getAllfiles

exports.deletefile = function (index, callback) {
  db.all(`SELECT * FROM ${grp_files_table} WHERE ItemID = ${index}`, function (err, res) {
    var sql1 = `DELETE FROM ${cell_content_table} WHERE FileID = ${index}`
    var sql2 = `DELETE FROM ${cell_formats_table} WHERE FileID = ${index}`
    var sql3 = `DELETE FROM ${row_content_table} WHERE FileID = ${index}`
    var sql4 = `DELETE FROM ${grp_files_table} WHERE ItemID = ${index}`

    db.run(sql1)
    db.run(sql2)
    db.run(sql3)
    db.run(sql4)

    getAllfiles(function (data) {
      callback(data)
    })
  })
}

exports.uploadFiles = function (post, callback) {
  var fileID = '';

  if (post.File) {
    fileID = insertGRPFilesRecord(post.File, function (id) {
      var data = {
        CellFormats: post.CellFormats,
        PageHeader: post.PageHeader,
        PageContent: post.PageContent
      }

      fs.writeFile(`./JsonData/${id}.json`, JSON.stringify(data), function () {})
    })
  } else {
    return
  }

  for (var element in post) {
    if ('CellFormats' === element) {
      insertCellFormatsRecord(post.CellFormats, fileID)
    } else if ('PageContent' === element) {
      insertPageContentRecord(post.PageContent, fileID, 0)
    } else if ('PageHeader' === element) {
      insertPageContentRecord(post.PageHeader, fileID, 1)
    }
  }

  getAllfiles(function (data) {
    callback(data)
  })
}

exports.getFileContent = function (id, callback) {
  fs.exists(`./JsonData/${id}.json`, function (exists) {
    if (exists) {
      var data = fs.readFileSync('./JsonData/' + id.toString() + '.json');
      callback(data.toString())
    } else {
      console.log('File not exists.')
    }
  })
}

// db.close()