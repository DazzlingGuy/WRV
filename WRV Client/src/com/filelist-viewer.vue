<template>
  <div>
    <Table stripe border :columns="heads" :data="fileList"></Table>
    <el-upload align="center" class="upload-demo" ref="upload" action="" list-type="picture" :show-fileObject-list="true" :before-upload="beforeUpload" :on-preview="handlePreview" :on-remove="handleRemove" :auto-upload="false">
      <el-button style="margin: 20px; width:300px;" slot="trigger" size="large" type="primary">Import</el-button>
      <el-button style="margin: 20px; width:300px;" size="large" type="success" @click="submitUpload">Upload</el-button>
      <div slot="tip" class="el-upload__tip" style="color: red">只能上传"*.GRP"文件</div>
    </el-upload>
  </div>
</template>

<script>
import GRPTransform from "../js/utils/grp-transform.js";
var transform = new GRPTransform();

import { getFileList, deleteFile, uploadFile } from "../js/request/request.js";

export default {
  data() {
    return {
      heads: [
        {
          title: "Index",
          key: "index",
          align: "center",
          sortable: true
        },
        {
          title: "FileName",
          key: "name",
          align: "center",
          sortable: true
        },
        {
          title: "LastModify",
          key: "time",
          align: "center",
          sortable: true
        },
        {
          title: "Action",
          key: "action",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.show(params.row.index);
                    }
                  }
                },
                "View"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row.index);
                    }
                  }
                },
                "Delete"
              )
            ]);
          }
        }
      ],
      fileList: [],
      fileContent: "",
      fileObject: null
    };
  },

  beforeCreate() {
    FileReader.prototype.reading = function({ encode } = pms) {
      let bytes = new Uint8Array(this.result);
      let text = new TextDecoder(encode || "UTF-8").decode(bytes);
      return text;
    };

    FileReader.prototype.readAsBinaryString = function(file) {
      if (!this.onload)
        this.onload = e => {
          let rs = this.reading();
        };
      this.readAsArrayBuffer(file);
    };
  },

  created() {
    this.refreshFileList();
  },

  methods: {
    beforeUpload(fileObject) {
      var suffix = "";

      try {
        var array = fileObject.name.split(".");
        suffix = array[array.length - 1];
      } catch (err) {
        suffix = "";
      }

      if (suffix.toLowerCase() != "grp") {
        alert('只能上传"*.GRP"文件');
        this.fileObject = null;
        return false;
      }

      this.fileObject = fileObject;
    },

    refreshFileList() {
      getFileList().then(response => {
        this.fileList = response;
      });
    },

    read(file, callback) {
      let reader = new FileReader();

      reader.onload = e => {
        let readContent = reader.reading({ encode: "UTF-8" });
        let formerData = this.fileContent;
        this.fileContent = formerData + readContent;
        callback(this.fileContent);
      };

      reader.readAsBinaryString(file);
    },

    show(index) {
      this.$router.replace(`/report?index=${index}`);
    },

    remove(index) {
      deleteFile(index).then(response => {
        this.fileList = response;
      });
    },

    submitUpload() {
      // callback the beforeUpload methods
      this.$refs.upload.submit();

      if (this.fileObject == null) {
        return;
      }

      this.read(this.fileObject, response => {
        transform.transform(response);
        var cellFormats = transform.getFormats();
        var pageHeader = transform.getHeader();
        var pageContent = transform.getContent();
        uploadFile({
          File: { fileName: this.fileObject.name, adjustTime: new Date() },
          CellFormats: cellFormats,
          PageHeader: pageHeader,
          PageContent: pageContent
        }).then(response => {
          this.fileList = response;
        });
      });
    },

    handleRemove(fileObject, fileList) {
      console.log(fileObject, fileList);
    },

    handlePreview(fileObject) {
      console.log(fileObject);
    }
  }
};
</script>

<style>
</style>