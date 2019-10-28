/*!
 * =====================================================
 * GRP 转换工具 封装
 * author: rensl
 * =====================================================
 */

// todo 重构

import xmlLoader from './xml-loader';

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

function getCellFormatData(cellFormat) {
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

function getCellDataJsonObject(cellData, isLastRow) {
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

    // todo expand column header row span
    var formatRowSpan = (cellData) => {
        if (cellData.hasAttribute(GRPPageBodyConsts.RowSpan)) {
            return cellData.getAttribute(GRPPageBodyConsts.RowSpan)
        } else {
            return 1
        }
    }

    // todo collection col span
    var formatColSpan = (cellData, isLastRow) => {
        if (cellData.hasAttribute(GRPPageBodyConsts.ColSpan)) {
            return isLastRow ? cellData.getAttribute(GRPPageBodyConsts.ColSpan) - 2 : cellData.getAttribute(GRPPageBodyConsts.ColSpan)
        } else {
            return 1
        }
    }

    return {
        Row: cellData.getAttribute(GRPPageBodyConsts.Row),
        Col: cellData.getAttribute(GRPPageBodyConsts.Col),
        RowSpan: formatRowSpan(cellData),
        ColSpan: formatColSpan(cellData, isLastRow),
        DataType: cellData.getAttribute(GRPPageBodyConsts.DataType),
        CellFormat: cellData.getAttribute(GRPPageBodyConsts.CellFormat),
        Value: formatValue(String(cellData.getAttribute(GRPPageBodyConsts.Value))),
        CanEdit: false
    }
}

function GRPTransform() {
    this.reportContent = null
}

GRPTransform.prototype.transform = function (content) {
    this.reportContent = xmlLoader.loadXML(content)
}

GRPTransform.prototype.getReportContent = function () {
    return this.reportContent
}

GRPTransform.prototype.getDetail = function () {
    return this.reportContent.getElementsByTagName(GRPPageConsts.Detail)[0]
}

GRPTransform.prototype.getCellFormats = function () {
    return this.reportContent.getElementsByTagName(GRPPageConsts.CellFormats)[0]
}

GRPTransform.prototype.getBodyCells = function () {
    var detail = this.getDetail()
    return detail.getElementsByTagName(GRPPageBodyConsts.Cells)[0]
}

GRPTransform.prototype.getBodyColumns = function () {
    var detail = this.getDetail()
    return detail.getElementsByTagName(GRPPageBodyConsts.Cols)[0]
}

GRPTransform.prototype.getBodyRows = function () {
    var detail = this.getDetail()
    return detail.getElementsByTagName(GRPPageBodyConsts.Rows)[0]
}

// GRP文件格式中行列号均定义为ID，感觉很奇怪
GRPTransform.prototype.getRowCount = function () {
    return this.getDetail().getElementsByTagName(GRPPageBodyConsts.Grid)[0].getAttribute(GRPPageBodyConsts.RowCount) - 1
}

GRPTransform.prototype.getColumnCount = function () {
    return this.getDetail().getElementsByTagName(GRPPageBodyConsts.Grid)[0].getAttribute(GRPPageBodyConsts.ColCount) - 1
}

GRPTransform.prototype.reportCellFormat = function () {
    var jsonObject = []
    var cellFormatList = this.getCellFormats().children
    for (let index = 0; index < cellFormatList.length; index++) {
        const element = cellFormatList[index];
        jsonObject.push(getCellFormatData(element))
    }
    return jsonObject
}

// todo 需要重新梳理GRP文件格式，这个函数太乱了
GRPTransform.prototype.reportBodyData = function () {
    var reportBodyData = []
    var reportRowCells = []

    var currentRow = 1
    var allRowCount = parseInt(this.getRowCount())

    var currentRowHasValue = false
    var needAdd = true

    var bodyCells = this.getBodyCells().children
    for (let index = 0; index < bodyCells.length; index++) {
        const element = bodyCells[index];

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
                // isLastRow处理汇总行，需重构
                reportRowCells.push(getCellDataJsonObject(element, innerCurrentRow == allRowCount))
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

export default GRPTransform