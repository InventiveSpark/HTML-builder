const { createReadStream } = require('fs');
const { join } = require('path');

const fileName = 'text.txt';
const filePath = join(__dirname, fileName);

const { stdout, stderr } = process;

const conColors = {
  red: '\x1b[31m',
};

const errorHandler = (error) => {
  stderr.write(`${conColors.red}Error ${error.message}`);
  process.exit(1);
};

const readStream = createReadStream(filePath, 'utf8');
readStream.on('error', error => errorHandler(error));
readStream.pipe(stdout).on('error', error => errorHandler(error));