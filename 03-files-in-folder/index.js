const { readdir, stat } = require('fs/promises');
const { join, extname, basename } = require('path');

const dirName = 'secret-folder';
const dirPath = join(__dirname, dirName);

const { stdout, stderr } = process;

const conColors = {
  blue: '\x1b[34m',
  red: '\x1b[31m',
  white: '\x1b[37m',
};

const errorHandler = (error) => {
  stderr.write(`${conColors.red}Error ${error.message}`);
  process.exit(1);
};

const getFileStats = async (fileName) => {
  const filePath = join(dirPath, fileName);
  try {
    const fileStats = await stat(filePath);
    stdout.write(`${getFileInfoStr(filePath, fileStats)}\n`);
  } catch (error) {
    if (error) errorHandler(error);
  }
};

const getFileInfoStr = (filePath, fileStats) => {
  const colorize = (string) => `${conColors.blue}${string}${conColors.white}`;
  let fileExt = extname(filePath);
  const fileName = basename(filePath, fileExt);
  fileExt = fileExt.slice(1);
  const fileSize = (fileStats.size < 1000) ? `${fileStats.size}${colorize('B')}` : `${(fileStats.size / 1000).toFixed(3)}${colorize('kB')}`;
  // https://en.wikipedia.org/wiki/Kilobyte
  // kilobyte: 1 kB  = 1000 B
  // kibibyte: 1 KiB = 1024 B
  return [fileName, fileExt, fileSize].join(colorize(' - '));
};

(async () => {
  try {
    const filesAndDirs = await readdir(dirPath, { withFileTypes: true });
    filesAndDirs.filter(file => file.isFile()).forEach(file => getFileStats(file.name));
  } catch (error) {
    if (error) errorHandler(error);
  }
})();