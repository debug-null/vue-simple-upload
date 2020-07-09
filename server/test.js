const path = require('path');
const fse = require('fs-extra');

const pipeStream = (path, writeStream) =>
  new Promise((resolve) => {
    const readStream = fse.createReadStream(path);
    readStream.on('end', () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });

pipeStream(
  'F:github/file-upload-master/target/25fd235efb55e286633b22b3f87a6ffe',
  'F:github/file-upload-master/target/25fd235efb55e286633b22b3f87a6ffe/0'
);
