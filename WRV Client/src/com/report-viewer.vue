<template lang="">
    <div>
        <table class="table table-hover table-responsive table-custom table-bordered">
            <thead class="thead-inverse">
                <tr class="HeadRow" v-if="header" v-for="header in getPageHeaderList()" :key="header.RowID">
                    <th :style="getCellFormat(cell.CellFormat)" v-for="cell in header.RowData" :rowspan="cell.RowSpan" :colspan="cell.ColSpan - 2" @dblclick="onFocusIn(cell)">
                        <input type="text" class="form-control" :value="cell.Value" v-if="cell.CanEdit" @blur="onFocusOut(cell)" v-focus @input="onDataChanged">
                        <span v-if="!cell.CanEdit">{{ cell.Value }}</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr class="DataRow" v-if="row" v-for="row in getPageRowList()" :key="row.RowID">
                    <td :style="getCellFormat(cell.CellFormat)" v-for="cell in row.RowData" :rowspan="cell.RowSpan" :colspan="cell.ColSpan" @dblclick="onFocusIn(cell)">
                        <input type="text" class="form-control" :value="cell.Value" v-if="cell.CanEdit" @blur="onFocusOut(cell)" v-focus @input="onDataChanged">
                        <span v-if="!cell.CanEdit">{{ cell.Value }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import GRPTransform from "../js/utils/grp-transform.js";
var Transform = new GRPTransform();

import { getData } from "../js/request/request.js";

export default {
  data() {
    return {
      cellFormats: [],
      pageContent: [],
      inputData: ""
    };
  },
  created() {
    getData(this.$route.query.index).then(response => {
      this.cellFormats = response.CellFormats;
      this.pageContent = response.PageContent;
    });
  },
  methods: {
    onDataChanged(element) {
      this.inputData = element.target.value;
    },

    onFocusIn(cell) {
      cell.CanEdit = true;
      this.inputData = cell.Value;
    },

    onFocusOut(cell) {
      cell.CanEdit = false;
      cell.Value = this.inputData;
    },

    getCellFormat(index) {
      var cellFormat = this.cellFormats[index - 1];

      var fontFamily = `font-family:${cellFormat.FontName};`;
      var fontSize = `font-size:${cellFormat.FontSize}pt;`;
      var fontHeight = `line-height: 14pt;`;

      var fontWeight =
        cellFormat.FontIsBold == "true"
          ? "font-weight:bold;"
          : "font-weight:normal;";

      var fontStyle =
        cellFormat.FontIsItalic == "true"
          ? "font-style:italic;"
          : "font-style:normal;";

      var fontUnderLine =
        cellFormat.FontIsUnderLine === "true"
          ? "text-decoration: underline;"
          : "text-decoration: none;";

      var fontTextAlign = (function() {
        switch (cellFormat.HorzAlignment) {
          case "0":
            return "text-align: auto;";
            break;
          case "1":
            return "text-align: left;";
            break;
          case "2":
            return "text-align: right;";
            break;
          case "3":
            return "text-align: center;";
            break;
          case "4":
            return "text-align: justify;";
            break;
          default:
            return "";
        }
      })(cellFormat.HorzAlignment);

      var fontVertAlignment = (function() {
        switch (cellFormat.VertAlignment) {
          case "1":
            return "vertical-align: auto;";
            break;
          case "2":
            return "vertical-align: bottom;";
            break;
          case "3":
            return "vertical-align: top;";
            break;
          case "4":
            return "vertical-align: center;";
            break;
          default:
            return "";
        }
      })(cellFormat.VertAlignment);

      return (
        fontFamily +
        fontSize +
        fontHeight +
        fontWeight +
        fontStyle +
        fontUnderLine +
        fontTextAlign +
        fontVertAlignment
      );
    },

    getPageHeaderList() {
      // todo: 目前只处理了无扩展列形式的报表
      var array = [];

      if (this.pageContent) {
        array.push(this.pageContent[0]);
      } else {
        console.log("pageContent is null object.");
      }

      return array;
    },

    getPageRowList() {
      // todo 目前只处理了无扩展列形式的报表
      var array = [];

      for (let index = 1; index < this.pageContent.length; index++) {
        array.push(this.pageContent[index]);
      }

      return array;
    }
  },

  directives: {
    focus: {
      inserted: function(el) {
        el.focus();
      }
    }
  }
};
</script>

<style lang="css" scoped>
</style>