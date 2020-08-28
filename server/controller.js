const multiparty = require('multiparty');
const path = require('path');
const fse = require('fs-extra');
const url = require('url');

const extractExt = (filename) =>
  filename.slice(filename.lastIndexOf('.'), filename.length); // 提取后缀名

const UPLOAD_DIR = path.resolve(__dirname, '..', 'target'); // 大文件存储目录

const pipeStream = (path, writeStream) =>
  new Promise((resolve) => {
    const readStream = fse.createReadStream(path);
    readStream.on('end', () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });

// 合并切片
/**
 *
 * @param {*} filePath 文件目录
 * @param {*} fileHash md5值
 * @param {*} size 切片的个数
 */
const mergeFileChunk = async (filePath, fileHash, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash);
  const chunkPaths = await fse.readdir(chunkDir);
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序可能会错乱
  chunkPaths.sort((a, b) => Number(a) - Number(b));
  await Promise.all(
    chunkPaths.map((chunkPaths, index) =>
      pipeStream(
        path.resolve(chunkDir, chunkPaths),
        // 指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * 5 * 10 * 1024 * 1024
          // end: (index + 1) * size
        })
      )
    )
  )
  ;
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
};

const resolvePost = (req) =>
  new Promise((resolve) => {
    let chunk = '';
    req.on('data', (data) => {
      chunk += data;
      console.log('chunk', chunk);
    });
    req.on('end', () => {
      resolve(JSON.parse(chunk));
    });
  });

module.exports = class {
  // 合并切片
  async handleMerge(req, res) {
    const data = await resolvePost(req);
    const { md5, fileName, fileChunkNum } = data;
    const ext = extractExt(fileName);
    const filePath = path.resolve(UPLOAD_DIR, `${md5}${ext}`);
    await mergeFileChunk(filePath, md5, fileChunkNum);
    return rendAjax(res, {
      code: 2000,
      message: '合并成功'
    });
  }
  // 处理切片
  async handleFileChunk(req, res) {
    const multipart = new multiparty.Form();

    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        res.status = 500;
        res.end('process file chunk failed');
        return;
      }
      const [chunk] = files.file;
      const [hash] = fields.md5;
      const [chunkId] = fields.chunkId;
      console.log('handleFileChunk -> chunkId', chunkId);
      const chunkDir = path.resolve(UPLOAD_DIR, hash);

      // 切片目录不存在，创建切片目录
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir);
      }

      // 文件存在直接返回
      if (fse.existsSync(path.resolve(chunkDir, chunkId))) {
        return rendAjax(res, {
          code: 2001,
          message: '文件已存在'
        });
      }

      // fs-extra 专用方法，类似 fs.rename 并且跨平台
      // fs-extra 的 rename 方法 windows 平台会有权限问题
      // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
      try {
        await fse.move(chunk.path, path.resolve(chunkDir, chunkId));
      } catch (error) {
        console.log('handleFileChunk -> error', error);
      }
      rendAjax(res, {
        code: 200,
        message: '切片上传成功'
      });
      return;
    });
  }
  // 验证是否已上传/已上传切片下标
  async handleVerifyUpload(req, res) {
    var data = url.parse(req.url, true);
    const { md5, fileName } = data.query;
    const ext = extractExt(fileName);
    const filePath = path.resolve(UPLOAD_DIR, `${md5}${ext}`);
    if (fse.existsSync(filePath)) {
      return rendAjax(res, {
        code: 2000,
        message: '操作成功',
        data: {
          md5: md5,
          presence: true
        }
      });
    } else {
      return rendAjax(res, {
        code: 2000,
        message: '操作成功',
        data: {
          md5: md5,
          presence: false
        }
      });
    }
  }
};

const rendAjax = (res, obj) => {
  res.end(JSON.stringify(obj));
};
