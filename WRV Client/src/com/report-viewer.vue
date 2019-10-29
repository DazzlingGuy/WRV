<template lang=''>
    <div>
        <table class='table table-hover table-responsive table-custom table-bordered'>
            <thead class='thead-inverse'>
                <tr class='HeadRow' v-if='header' v-for='header in getPageHeaderList()' :key='header.RowID'>
                    <th :style='getCellFormat(cell.CellFormat)' v-for='cell in header.RowData' :rowspan='cell.RowSpan'
                        :colspan='cell.ColSpan' @dblclick='onFocusIn(cell)'>
                        <input type='text' class='form-control' :value='cell.Value' v-if='cell.CanEdit'
                            @blur='onFocusOut(cell)' @input='onDataChanged' v-focus>
                        <span v-if='!cell.CanEdit'>{{ cell.Value }}</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr class='DataRow' v-if='row' v-for='row in getPageRowList()' :key='row.RowID'>
                    <td :style='getCellFormat(cell.CellFormat)' v-for='cell in row.RowData' :rowspan='cell.RowSpan'
                        :colspan='cell.ColSpan' @dblclick='onFocusIn(cell)'>
                        <input type='text' class='form-control' :value='cell.Value' v-if='cell.CanEdit'
                            @blur='onFocusOut(cell)' @input='onDataChanged' v-focus>
                        <span v-if='!cell.CanEdit'>{{ cell.Value }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { getData } from "../js/request/request.js";

import { Notification } from "element-ui";

var GLOBAL_PAGE_INDEX = -1;

export default {
  data() {
    return {
      cellFormats: [],
      pageContent: [],
      pageHeader: [],
      inputData: ""
    };
  },
  created() {
    if (GLOBAL_PAGE_INDEX === -1 && this.$route.query.index != undefined) {
      GLOBAL_PAGE_INDEX = this.$route.query.index;
    }

    if (GLOBAL_PAGE_INDEX === -1) {
      Notification({
        title: "Special Note.",
        message: 'Please selete a grp file and click "view" to preview.',
        showClose: false,
        position: "bottom-right",
        offset: 50,
        iconClass: "info"
      });
    } else {
      if (this.$route.query.index != undefined) {
        GLOBAL_PAGE_INDEX = this.$route.query.index;
      }
      getData(GLOBAL_PAGE_INDEX).then(response => {
        this.cellFormats = response.CellFormats;
        this.pageContent = response.PageContent;
        this.pageHeader = response.PageHeader;
      });
    }
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
      return this.pageHeader;
    },

    getPageRowList() {
      return this.pageContent;
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

<style lang='css' scoped>
</style>