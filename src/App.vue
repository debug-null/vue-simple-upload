<template>
  <div id="app">
    <div class="mater-upload-container">
      <Simple
        ref="upload"
        :headers="headers"
        :before-upload="beforeUpload"
        :accept="accepts"
        :upload-arguments="uploadArgumentsObj"
        :limit="limit"
        :on-exceed="fileLimitFn"
        :base-url="baseUrl"
        :chunk-size="chunkSize"
        @success="success"
      >
        <div slot="tip" class="upload-tip">
          <i class="el-icon-info"></i>:
          只能上传：{{ acceptDesc[uploadType] }}
        </div>
      </Simple>
    </div>
  </div>
</template>
<script>
import Simple from './simple';
export default {
  name: 'MaterUpload',
  components: { Simple },
  data: () => ({
    accepts: 'image/png',
    acceptsObj: {
      video: ['video/mp4'],
      image: [
        'image/png',
        'image/gif',
        'image/jpeg',
        'image/jpg',
        'image/bmp',
        '.'
      ], // 火狐的accept只支持【.png,.jpg】这种形式，为了兼容，使用 .
      audio: ['audio/mp3', 'audio/mpeg'],
      ppt: [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.ppt',
        '.pptx'
      ],
      excel: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
      zip: [
        'application/x-zip-compressed',
        '.zip'
      ]
    },
    acceptDesc: {
      video: 'mp4',
      image: 'png,gif,jpeg,jpg,bmp',
      audio: 'mp3',
      ppt: 'ppt',
      excel: 'xls,xlsx',
      zip: 'zip,rar'
    },
    // 临时自测使用
    uploadArguments: {
      // type: 'video'
      type: 'zip'
    },
    limit: 20,
    chunkSize: 50 * 1024 * 1024,
    share: 1 // 是否共享 0私有  1共享
  }),
  computed: {
    headers() {
      return {
        Authorization: 'token'
      };
    },
    baseUrl() {
      return 'http://localhost:3000/';
    },
    uploadType() {
      return this.uploadArguments.type;
    },
    uploadArgumentsObj() {
      return { ...this.uploadArguments, share: this.share };
    }
  },

  created() {
    if (this.uploadType) {
      this.accepts = this.acceptsObj[this.uploadType].join(','); // 设置文件类型
    } else {
      this.$message('存在类型不正确的文件');
    }
  },
  methods: {
    beforeUpload(file) {
      console.log('beforeAvatarUpload -> file', file);
      if (this.acceptsObj[this.uploadType].indexOf(file.type) === -1) {
        this.$notify({
          message: '只能上传' + this.acceptDesc[this.uploadType],
          type: 'warning',
          offset: 50
        });
        return false;
      }
      if (!file.size) {
        setTimeout(() => {
          this.$notify({
            message: '不能上传大小为0的文件',
            type: 'warning',
            offset: 50
          });
        }, 500);
        return false;
      }
      return this.propertyRestrictions(file);
    },
    // 文件个数限制钩子
    fileLimitFn(files) {
      this.$message.warning(
        `最多支持选择${this.limit}个文件`
      );
    },
    // 清空文件，暂未使用
    clearFiles() {
      this.$refs.upload.clearFiles();
    },
    success() {
      // this.$message('上传成功');
    },
    // 属性限制
    async propertyRestrictions(file) {
      return new Promise(async (resolve, reject) => {
        if (this.uploadType === 'image') {
          const isVerifyResolution = await this.verifyResolution(file);
          console.log('propertyRestrictions -> isVerifyResolution', isVerifyResolution);
          if (!isVerifyResolution) {
            this.$message(this.$t('messageTips.notAbove4k'));
            reject();
          }
        }
        resolve(true);
      });
    },
    // 分辨率校验
    verifyResolution(file, maxWidth = 3840, maxHeight = 2160) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          if (reader.readyState === 2) {
            const img = new Image();
            img.src = reader.result;
            img.onload = function () {
              const width = this.width;
              const height = this.height;
              const bool = width > maxWidth || height > maxHeight;
              if (bool) {
                resolve(false);
              }
              resolve(true);
            };
          }
        };
      });
    }
  }
};
</script>
<style scoped lang="scss">
.mater-upload-container {
  >>> .simple-upload-container {
    border: none;
    max-height: 500px;
  }
}
</style>
