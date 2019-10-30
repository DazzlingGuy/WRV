var sqlite3 = require('sqlite3')
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
    console.log(`Open database error, cuz ${err}.`)
  }

  initMaxItemID()
})

function initMaxItemID() {
  DATA_BASE_TABLE.forEach(table => {
    db.all(`SELECT MAX(ItemID) FROM ${table}`, function (err, res) {
      if (err === null) {
        res.forEach(query => {
          let id = +query['MAX(ItemID)']
          MAX_ITEM_ID = id > MAX_ITEM_ID ? id : MAX_ITEM_ID
        })
      }
    })
  })
}

function generateItemID() {
  MAX_ITEM_ID += 1
  return MAX_ITEM_ID
}

async function insertCellFormatRecord(format, fileID) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO ${CELL_FORMATS_TABLE}(ItemID, FileID, FontIsBold, BottomMargin, LeftLineWidth, RightLineWidth, FontName, FontSize, BottomLineWidth,\
      TopLineWidth, TopMargin, VertAlignment, FontColor, RightMargin, HorzAlignment, FontIsUnderLine, FontIsItalic, LeftMargin)\VALUES(${generateItemID()}, ${fileID}, ${format.FontIsBold}, ${format.BottomMargin}, ${format.LeftLineWidth}, ${format.RightLineWidth}, ${format.FontName},
      ${format.FontSize}, ${format.BottomLineWidth}, ${format.TopLineWidth}, ${format.TopMargin}, ${format.VertAlignment}, ${format.FontColor},
      ${format.RightMargin}, ${format.HorzAlignment}, ${format.FontIsUnderLine}, ${format.FontIsItalic}, ${format.LeftMargin})`

    sql.replace('false', 0)
    sql.replace('true', 1)

    db.run(sql, res => {
      if (res === null)
        resolve()
      else
        reject(res)
    })
  })
}

async function insertCellFormatsRecord(formats, fileID) {
  for (let index = 0; index < formats.length; index++) {
    const format = formats[index]
    await insertCellFormatRecord(format, fileID)
  }
}

async function insertGRPFilesRecord(file, fileID) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO ${GRP_FILES_TABLE}(ItemID, FileName, AdjustTime) VALUES(${fileID}, '${file.FileName}', '${file.AdjustTime}')`

    db.run(sql, res => {
      if (res === null)
        resolve()
      else
        reject(res)
    })
  })
}

async function insertCellContentRecord(cell, fileID, rowID) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO ${CELL_CONTENT_TABLE}(ItemID, FileID, Row, Col, CellFormat, Value, ColSpan, DataType, RowSpan)
    VALUES(${generateItemID()}, ${fileID}, ${rowID}, ${cell.Col}, ${cell.CellFormat}, '${cell.Value}', ${cell.ColSpan}, ${cell.DataType}, ${cell.RowSpan})`

    sql.replace('false', 0)
    sql.replace('true', 1)

    db.run(sql, res => {
      if (res === null)
        resolve()
      else
        reject(res)
    })
  })
}

async function insertPageContentRecord(rows, fileID, type) {
  for (let index = 0; index < rows.length; index++) {
    rowID = generateItemID()

    const row = rows[index]

    let sql = `INSERT INTO ${ROW_CONTENT_TABLE}(ItemID, FileID, Row, Type) VALUES(${rowID}, ${fileID}, ${row.RowID}, ${type})`

    db.run(sql)

    for (let index = 0; index < row.RowData.length; index++) {
      const cell = row.RowData[index]

      await insertCellContentRecord(cell, fileID, rowID)
    }
  }
}

async function getAllFileList() {
  return new Promise((resolve, reject) => {
    db.all(`select * from ${GRP_FILES_TABLE}`, async function (err, res) {
      if (err === null) {
        let array = []
        res.forEach(query => {
          array.push({
            index: query.ItemID,
            name: query.FileName,
            time: query.AdjustTime
          })
        })
        resolve(JSON.stringify(array))
      } else {
        reject(err)
      }
    })
  })
}

async function deleteFileFromDB(index) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${GRP_FILES_TABLE} WHERE ItemID = ${index}`, async function (err, res) {
      if (err === null) {
        let sql1 = `DELETE FROM ${CELL_CONTENT_TABLE} WHERE FileID = ${index}`
        let sql2 = `DELETE FROM ${CELL_FORMATS_TABLE} WHERE FileID = ${index}`
        let sql3 = `DELETE FROM ${ROW_CONTENT_TABLE} WHERE FileID = ${index}`
        let sql4 = `DELETE FROM ${GRP_FILES_TABLE} WHERE ItemID = ${index}`

        db.run(sql1, err => {
          if (err)
            reject(err)
        })

        db.run(sql2, err => {
          if (err)
            reject(err)
        })

        db.run(sql3, err => {
          if (err)
            reject(err)
        })

        db.run(sql4, err => {
          if (err)
            reject(err)
        })

        resolve()
      } else {
        reject(err)
      }
    })
  })
}

async function deleteFile(index) {
  return new Promise((resolve, reject) => {
    deleteFileFromDB(index).then(data => {
      return getAllFileList()
    }).then(data => {
      resolve(data)
    })
  })
}

async function uploadFile(post) {
  // 先保存文件信息
  if (post.File === null) {
    return
  }

  let fileID = generateItemID()

  await insertGRPFilesRecord(post.File, fileID)

  for (let query in post) {
    if ('CellFormats' === query) {
      await insertCellFormatsRecord(post.CellFormats, fileID)
    } else if ('PageContent' === query) {
      await insertPageContentRecord(post.PageContent, fileID, 0)
    } else if ('PageHeader' === query) {
      await insertPageContentRecord(post.PageHeader, fileID, 1)
    }
  }

  return await getAllFileList()
}

async function getFileCreateInfoFromDB(id) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${GRP_FILES_TABLE} WHERE ItemID = ${id}`, async function (err, res) {
      if (err === null && res.length != 0) {
        let fileInfoSqlObject = res[0]
        resolve({
          index: id,
          name: fileInfoSqlObject.FileName,
          time: fileInfoSqlObject.AdjustTime
        })
      } else {
        reject(err)
      }
    })
  })
}

async function getCellFormatsFromDB(id) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${CELL_FORMATS_TABLE} WHERE FileID = ${id} ORDER BY ItemID`, async function (err, res) {
      if (err === null) {
        let cellFormats = []
        res.forEach(query => {
          cellFormats.push({
            FontIsBold: query.FontIsBold,
            BottomMargin: query.BottomMargin,
            LeftLineWidth: query.LeftLineWidth,
            RightLineWidth: query.RightLineWidth,
            FontName: query.FontName,
            FontSize: query.FontSize,
            BottomLineWidth: query.BottomLineWidth,
            TopLineWidth: query.TopLineWidth,
            TopMargin: query.TopMargin,
            VertAlignment: query.VertAlignment,
            FontColor: query.FontColor,
            RightMargin: query.RightMargin,
            HorzAlignment: query.HorzAlignment,
            FontIsUnderLine: query.FontIsUnderLine,
            FontIsItalic: query.FontIsItalic,
            LeftMargin: query.LeftMargin
          })
        })
        resolve(cellFormats)
      } else {
        reject(err)
      }
    })
  })
}

async function getRowQueryListFromDB(id, type) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${ROW_CONTENT_TABLE} WHERE FileID = ${id} AND Type = ${type} ORDER BY ItemID`, async function (err, res) {
      if (err === null) {
        resolve(res)
      } else {
        reject(err)
      }
    })
  })
}

async function getCellQueryListFromDB(id) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${CELL_CONTENT_TABLE} WHERE Row = ${id} ORDER BY ItemID`, async function (err, res) {
      if (err === null) {
        resolve(res)
      } else {
        reject(err)
      }
    })
  })
}

async function getRowContentFromDB(id, type) {
  let rowContentList = []

  let rowQueryList = await getRowQueryListFromDB(id, type)

  for (let index = 0; index < rowQueryList.length; index++) {
    const rowQuery = rowQueryList[index]

    let rowContentObject = {
      RowID: rowQuery['ItemID'],
      RowData: []
    }

    let cellQueryList = await getCellQueryListFromDB(rowQuery['ItemID'])

    for (let index = 0; index < cellQueryList.length; index++) {
      const cellQuery = cellQueryList[index]
      rowContentObject.RowData.push({
        Row: cellQuery.Row,
        Col: cellQuery.Col,
        RowSpan: cellQuery.RowSpan,
        ColSpan: cellQuery.ColSpan,
        DataType: cellQuery.DataType,
        Value: cellQuery.Value,
        CellFormat: cellQuery.CellFormat,
        CanEdit: false
      })
    }

    rowContentList.push(rowContentObject)
  }

  return rowContentList
}

async function getFileContent(id) {
  let contentObject = {
    File: await getFileCreateInfoFromDB(id),
    CellFormats: await getCellFormatsFromDB(id),
    PageHeader: await getRowContentFromDB(id, 1),
    PageContent: await getRowContentFromDB(id, 0),
  }

  return JSON.stringify(contentObject)
}

module.exports = {
  getFileContent: getFileContent,
  getAllFileList: getAllFileList,
  deleteFile: deleteFile,
  uploadFile: uploadFile
}