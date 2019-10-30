/*!
 * =====================================================
 * GRP 转换工具 封装
 * author: rensl
 * =====================================================
 */

// todo 重构

import xmlLoader from './xml-loader'

var GRPPageConsts = {
    Report: 'Report',
    Parameters: 'Parameters',
    CellFormats: 'CellFormats',
    Pages: 'Pages',
    Detail: 'Detail',
    Option: 'Option',
    PageSetting: 'PageSetting',
    RimSetting: 'RimSetting'
}

var GRPCellFormatConsts = {
    FontIsItalic: 'FontIsItalic',
    FontSize: 'FontSize',
    TopMargin: 'TopMargin',
    LeftMargin: 'LeftMargin',
    TopLineWidth: 'TopLineWidth',
    FontIsStrikeOut: 'FontIsStrikeOut',
    RightLineWidth: 'RightLineWidth',
    FontName: 'FontName',
    RightMargin: 'RightMargin',
    HorzAlignment: 'HorzAlignment',
    BottomLineWidth: 'BottomLineWidth',
    BottomMargin: 'BottomMargin',
    FontIsBold: 'FontIsBold',
    VertAlignment: 'VertAlignment',
    FontIsUnderLine: 'FontIsUnderLine',
    LeftLineWidth: 'LeftLineWidth',
    FontColor: 'FontColor'
}

var GRPPageBodyConsts = {
    ID: 'ID',
    Grid: 'Grid',
    Rows: 'Rows',
    Cols: 'Cols',
    Row: 'Row',
    Col: 'Col',
    Height: 'Height',
    Width: 'Width',
    Cells: 'Cells',
    Cell: 'Cell',
    DataType: 'DataType',
    CellFormat: 'CellFormat',
    RowSpan: 'RowSpan',
    ColSpan: 'ColSpan',
    Value: 'Value',
    RowCount: 'RowCount',
    ColCount: 'ColCount'
}

function getCellFormatJsonObject(cellFormat) {
    return {
        FontIsBold: cellFormat.getAttribute(GRPCellFormatConsts.FontIsBold),
        BottomMargin: cellFormat.getAttribute(GRPCellFormatConsts.BottomMargin),
        LeftLineWidth: cellFormat.getAttribute(GRPCellFormatConsts.LeftLineWidth),
        RightLineWidth: cellFormat.getAttribute(GRPCellFormatConsts.RightLineWidth),
        FontName: cellFormat.getAttribute(GRPCellFormatConsts.FontName),
        FontSize: cellFormat.getAttribute(GRPCellFormatConsts.FontSize),
        BottomLineWidth: cellFormat.getAttribute(GRPCellFormatConsts.BottomLineWidth),
        TopLineWidth: cellFormat.getAttribute(GRPCellFormatConsts.TopLineWidth),
        TopMargin: cellFormat.getAttribute(GRPCellFormatConsts.TopMargin),
        VertAlignment: cellFormat.getAttribute(GRPCellFormatConsts.VertAlignment),
        FontColor: cellFormat.getAttribute(GRPCellFormatConsts.FontColor),
        RightMargin: cellFormat.getAttribute(GRPCellFormatConsts.RightMargin),
        HorzAlignment: cellFormat.getAttribute(GRPCellFormatConsts.HorzAlignment),
        FontIsUnderLine: cellFormat.getAttribute(GRPCellFormatConsts.FontIsUnderLine),
        FontIsItalic: cellFormat.getAttribute(GRPCellFormatConsts.FontIsItalic),
        LeftMargin: cellFormat.getAttribute(GRPCellFormatConsts.LeftMargin)
    }
}
    
var removeObject = (container, object) => {
    var index = container.findIndex(element => {
        return element === object
    })

    container.splice(index, 1)
}

function getCellJsonObject(cellData) {
    // 因为GRP文件的描述前后会带''
    var formatValue = str => {
        var returnValue = ''

        if ('null' === str) {
            returnValue = ''
        } else {
            for (let index = 0; index < str.length; index++) {
                let element = str[index]
                if ('\'' === element && (0 === index || str.length - 1 === index)) {
                    continue
                }
                returnValue += element
            }
        }

        return returnValue
    }

    var formatRowSpan = (cellData) => {
        if (cellData.hasAttribute(GRPPageBodyConsts.RowSpan)) {
            return cellData.getAttribute(GRPPageBodyConsts.RowSpan)
        } else {
            return 1
        }
    }

    var formatColSpan = (cellData) => {
        if (cellData.hasAttribute(GRPPageBodyConsts.ColSpan)) {
            return cellData.getAttribute(GRPPageBodyConsts.ColSpan)
        } else {
            return 1
        }
    }

    return {
        Row: cellData.getAttribute(GRPPageBodyConsts.Row),
        Col: cellData.getAttribute(GRPPageBodyConsts.Col),
        RowSpan: formatRowSpan(cellData),
        HasRowSpan: cellData.hasAttribute(GRPPageBodyConsts.RowSpan),
        ColSpan: formatColSpan(cellData),
        HasColSpan: cellData.hasAttribute(GRPPageBodyConsts.ColSpan),
        DataType: cellData.getAttribute(GRPPageBodyConsts.DataType),
        CellFormat: cellData.getAttribute(GRPPageBodyConsts.CellFormat),
        Value: formatValue(String(cellData.getAttribute(GRPPageBodyConsts.Value))),
        CanEdit: false
    }
}

function transform2Rows(bodyCellsNode) {
    var reportBodyData = []
    var reportRowCells = []

    var currentRow = 1

    var currentRowHasValue = false

    var bodyCells = bodyCellsNode.children
    for (let index = 0; index < bodyCells.length; index++) {
        const element = bodyCells[index]

        // 如果没有行参数，证明是不需要的单元格
        // 不知道GRP文件为什么会有这一行
        if (element.hasAttribute(GRPPageBodyConsts.Row)) {
            // 判断整行中Cell是否有值，如果无值，后续将不再添加本行
            if (element.hasAttribute(GRPPageBodyConsts.Value)) {
                currentRowHasValue = true
            }

            var innerCurrentRow = parseInt(element.getAttribute(GRPPageBodyConsts.Row))
            if (currentRow != innerCurrentRow) {
                // 循环至下一行的第一个，需要将上一行的report row cells加入
                if (currentRowHasValue) {
                    reportBodyData.push({
                        RowID: currentRow,
                        RowData: reportRowCells
                    })
                }

                // 对象参数置回
                currentRowHasValue = false
                currentRow = innerCurrentRow
                reportRowCells = []
            }

            // 添加Cell对象，无Col参数的对象是无效对象，直接忽略
            if (element.hasAttribute(GRPPageBodyConsts.Col)) {
                reportRowCells.push(getCellJsonObject(element))
            }
        }
    }

    // 最后一行
    reportBodyData.push({
        RowID: currentRow,
        RowData: reportRowCells
    })

    return reportBodyData
}

function hasHeaderFeature(row, allRows) {
    if (row.RowID === 1) {
        return true
    } else {
        // 非第一条取第一条的Row的ColSpan作参考
        var firstRow = allRows[0]

        var maxRowSpan = -1
        for (let index = 0; index < firstRow.RowData.length; index++) {
            const element = firstRow.RowData[index]
            maxRowSpan = element.RowSpan > maxRowSpan ? element.RowSpan : maxRowSpan
        }

        if (row.RowID <= maxRowSpan) {
            return true
        }

        return false
    }
}

function transform2Header(rows) {
    var headers = []
    for (let index = 0; index < rows.length; index++) {
        const element = rows[index]
        if (!hasHeaderFeature(element, rows)) {
            break
        }
        headers.push(element)
    }
    repairHeader(headers)
    return headers
}

function repairHeader(headers) {
    removeColSpanCell(headers)

    if (headers.length > 1) {
        removeRowSpanCell(headers)
    }
}

function removeRowSpanCell(headers) {
    var validCol = []

    // 非第一条取第一条的Row的RowSpan作参考
    var firstRow = headers[0]

    for (let index = 0; index < firstRow.RowData.length; index++) {
        const element = firstRow.RowData[index]
        if (element.ColSpan > 1 && !element.HasRowSpan) {
            for (let index = 0; index < element.ColSpan; index++) {
                validCol.push(parseInt(element.Col) + index)
            }
        }
    }

    // 从第二条开始循环
    for (let index = 1; index < headers.length; index++) {
        const header = headers[index]
        for (let index = 0; index < header.RowData.length; index++) {
            const cell = header.RowData[index]
            if (validCol.indexOf(parseInt(cell.Col)) == -1) {
                removeObject(header.RowData, cell)
                    --index
            }
        }
    }
}

function removeColSpanCell(rows) {
    var colSpan = 1
    for (let index = 0; index < rows.length; index++) {
        var row = rows[index]
        for (let index = 0; index < row.RowData.length; index++) {
            const cell = row.RowData[index]
            if (--colSpan != 0) {
                removeObject(row.RowData, cell)
                    --index
            } else {
                colSpan = cell.ColSpan
            }
        }
    }
}

function transform2Content(rows) {
    // todo according to business
    repiarContent(rows)
    return rows
}

function repiarContent(rows) {
    removeColSpanCell(rows)
}

function GRPTransform(content) {
    this.report = null
    this.header = []
    this.content = []
    this.formats = []
}

GRPTransform.prototype.transform = function (content) {
    this.report = null
    this.header = []
    this.content = []
    this.formats = []

    this.report = xmlLoader.loadXML(content)

    var allRows = transform2Rows(this.getBodyCells())

    this.header = transform2Header(allRows)
    this.header.forEach(element => {
        removeObject(allRows, element)
    });

    this.content = transform2Content(allRows)

    for (let index = 0; index < this.getCellFormats().children.length; index++) {
        const element = this.getCellFormats().children[index]
        this.formats.push(getCellFormatJsonObject(element))
    }
}

GRPTransform.prototype.getReportContent = function () {
    return this.report
}

GRPTransform.prototype.getDetail = function () {
    return this.report.getElementsByTagName(GRPPageConsts.Detail)[0]
}

GRPTransform.prototype.getCellFormats = function () {
    return this.report.getElementsByTagName(GRPPageConsts.CellFormats)[0]
}

GRPTransform.prototype.getBodyCells = function () {
    return this.getDetail().getElementsByTagName(GRPPageBodyConsts.Cells)[0]
}

GRPTransform.prototype.getBodyColumns = function () {
    return this.getDetail().getElementsByTagName(GRPPageBodyConsts.Cols)[0]
}

GRPTransform.prototype.getBodyRows = function () {
    return this.getDetail().getElementsByTagName(GRPPageBodyConsts.Rows)[0]
}

// GRP文件格式中行列号均定义为ID，感觉很奇怪
GRPTransform.prototype.getRowCount = function () {
    return this.getDetail().getElementsByTagName(GRPPageBodyConsts.Grid)[0].getAttribute(GRPPageBodyConsts.RowCount) - 1
}

GRPTransform.prototype.getColumnCount = function () {
    return this.getDetail().getElementsByTagName(GRPPageBodyConsts.Grid)[0].getAttribute(GRPPageBodyConsts.ColCount) - 1
}

GRPTransform.prototype.getFormats = function () {
    return this.formats
}

GRPTransform.prototype.getHeader = function () {
    return this.header
}

GRPTransform.prototype.getContent = function () {
    return this.content
}

export default GRPTransform