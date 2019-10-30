var sqlite3 = require('sqlite3')
var fs = require('fs')
var path = require('path')

var DATA_BASE_NAME = './serverDB/server.db'

var MAX_ITEM_ID = -1

var CELL_FORMATS_TABLE = 'CellFormats'
var ROW_CONTENT_TABLE = 'RowContent'
var CELL_CONTENT_TABLE = 'CellContent'
var GRP_FILES_TABLE = 'GRPFiles'

var DATA_BASE_TABLE = [GRP_FILES_TABLE, CELL_FORMATS_TABLE, ROW_CONTENT_TABLE, CELL_CONTENT_TABLE]

var db = new sqlite3.Database(path.join(__dirname, DATA_BASE_NAME), function (err) {
  if (err === null) {
    console.log(`Open database success.`)
  } else {
    console.log(`Open database error, cuz ${err}`)
  }

  DATA_BASE_TABLE.forEach(element => {
    db.all(`SELECT MAX(ItemID) FROM ${element}`, function (err, res) {
      if (!err) {
        res.forEach(element => {
          var id = +element['MAX(ItemID)']
          MAX_ITEM_ID = id > MAX_ITEM_ID ? id : MAX_ITEM_ID
        })
      }
    })
  })
})

function generateID() {
  MAX_ITEM_ID += 1
  return MAX_ITEM_ID
}

function insertCellFormatsRecord(data, fileID) {
  data.forEach(CellFormats => {
    var sql = `INSERT INTO ${CELL_FORMATS_TABLE}(ItemID, FileID, FontIsBold, BottomMargin, LeftLineWidth, RightLineWidth, FontName, FontSize, BottomLineWidth,\
      TopLineWidth, TopMargin, VertAlignment, FontColor, RightMargin, HorzAlignment, FontIsUnderLine, FontIsItalic, LeftMargin)\
      VALUES(${generateID()}, ${fileID}, ${CellFormats.FontIsBold}, ${CellFormats.BottomMargin}, ${CellFormats.LeftLineWidth}, ${CellFormats.RightLineWidth}, ${CellFormats.FontName},
      ${CellFormats.FontSize}, ${CellFormats.BottomLineWidth}, ${CellFormats.TopLineWidth}, ${CellFormats.TopMargin}, ${CellFormats.VertAlignment}, ${CellFormats.FontColor},
      ${CellFormats.RightMargin}, ${CellFormats.HorzAlignment}, ${CellFormats.FontIsUnderLine}, ${CellFormats.FontIsItalic}, ${CellFormats.LeftMargin})`

    sql.replace('false', 0)
    sql.replace('true', 1)

    db.run(sql)
  })
}

function insertGRPFilesRecord(post, fileID) {
  var sql = `INSERT INTO ${GRP_FILES_TABLE}(ItemID, FileName, AdjustTime) VALUES(${fileID}, '${post.File.FileName}', '${post.File.AdjustTime}')`

  db.run(sql)
}

function saveGRPJsonFile(post, fileID) {
  var data = {
    CellFormats: post.CellFormats,
    PageHeader: post.PageHeader,
    PageContent: post.PageContent
  }

  fs.writeFile(path.join(__dirname, `./JsonData/${fileID}.json`), JSON.stringify(data), err => {
    if (err) {
      console.log(`Save json file error, cuz ${err}`)
    }
  })
}

function insertCellContentRecord(data, fileID, RowID) {
  var sql = `INSERT INTO ${CELL_CONTENT_TABLE}(ItemID, FileID, Row, Col, CellFormat, Value, ColSpan, DataType, RowSpan)
  VALUES(${generateID()}, ${fileID}, ${RowID}, ${data.Col}, ${data.CellFormat}, '${data.Value}', ${data.ColSpan}, ${data.DataType}, ${data.RowSpan})`

  sql.replace('false', 0)
  sql.replace('true', 1)

  db.run(sql)
}

function insertPageContentRecord(data, fileID, type) {
  data.forEach(rowData => {
    rowID = generateID()
    var sql = `INSERT INTO ${ROW_CONTENT_TABLE}(ItemID, FileID, Row, Type) VALUES(${rowID}, ${fileID}, ${rowData.RowID}, ${type})`

    db.run(sql)

    rowData.RowData.forEach(cellData => {
      insertCellContentRecord(cellData, fileID, rowID)
    })
  })
}

var getAllfiles = function (callback) {
  var data = ''
  db.all(`select * from ${GRP_FILES_TABLE}`, function (err, res) {
    var array = new Array()
    if (!err) {
      res.forEach(element => {
        array.push({
          index: element.ItemID,
          name: element.FileName,
          time: element.AdjustTime
        })
      })
      data = JSON.stringify(array)
      callback(data)
    }
  })
}

exports.getAllfiles = getAllfiles

exports.deletefile = function (index, callback) {
  db.all(`SELECT * FROM ${GRP_FILES_TABLE} WHERE ItemID = ${index}`, function (err, res) {
    var sql1 = `DELETE FROM ${CELL_CONTENT_TABLE} WHERE FileID = ${index}`
    var sql2 = `DELETE FROM ${CELL_FORMATS_TABLE} WHERE FileID = ${index}`
    var sql3 = `DELETE FROM ${ROW_CONTENT_TABLE} WHERE FileID = ${index}`
    var sql4 = `DELETE FROM ${GRP_FILES_TABLE} WHERE ItemID = ${index}`

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
  var fileID = generateID()

  // 先保存文件信息
  if (post.File) {
    insertGRPFilesRecord(post, fileID)

    // todo 后续这个借口可能不再使用了
    saveGRPJsonFile(post, fileID)
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

// todo 文件读取值应该从数据库
exports.getFileContent = function (id, callback) {
  filePath = path.join(__dirname, `./JsonData/${id}.json`)
  fs.exists(filePath, function (exists) {
    if (exists) {
      var data = fs.readFileSync(filePath)
      callback(data.toString())
    } else {
      console.log('File not exists.')
    }
  })
}

// db.close()