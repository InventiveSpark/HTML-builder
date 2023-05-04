const { rm, mkdir, readdir } = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');
const { join, sep } = require('path');
const { pipeline } = require('stream/promises');

const sourceDirName = 'files';
const destDirName = `${sourceDirName}-copy`;
const sourceDir = join(__dirname, sourceDirName);
const destDir = join(__dirname, destDirName);

let dirNum = 0;
let fileNum = 0;

const { stdout, stderr } = process;

const conColors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  yellow: '\x1b[33m',
};

const colorize = (string, colorStart, colorEnd) => `${conColors[colorStart]}${string}${conColors[colorEnd]}`;

const errorHandler = (error) => {
  stderr.write(`${conColors.red}Error ${error.message}`);
  process.exit(1);
};

const copyDir = async (sourceDir, destDir, indent = '  ') => {
  try {
    const filesAndDirs = await readdir(sourceDir, { withFileTypes: true });
    for (const item of filesAndDirs) {
      const sourcePath = join(sourceDir, item.name);
      const destPath = join(destDir, item.name);
      if (item.isFile()) {
        const readStream = createReadStream(sourcePath);
        const writeStream = createWriteStream(destPath, { flags: 'w' });
        pipeline(readStream, writeStream);
        fileNum++;
        stdout.write(`${indent}${colorize(`'${item.name}'`, 'yellow', 'blue')} file copied\n`);
      }
      else if (item.isDirectory()) {
        await mkdir(destPath, { recursive: true });
        dirNum++;
        stdout.write(`${indent}${colorize(`'${item.name}${sep}'`, 'green', 'blue')} directory created\n`);
        await copyDir(sourcePath, destPath, `${indent}  `);
      }
    }
  }
  catch (error) {
    if (error) errorHandler(error);
  }
};

(async () => {
  try {
    await rm(destDir, { recursive: true, force: true });
    await mkdir(destDir, { recursive: true });
    dirNum++;
    stdout.write(`${colorize(`'${destDirName}${sep}'`, 'green', 'blue')} directory created\n`);
    await copyDir(sourceDir, destDir);
    stdout.write(`\n${colorize(`${dirNum}`, 'green', 'blue')} directories and ${colorize(`${fileNum}`, 'yellow', 'blue')} files are copied\n`);
  }
  catch (error) {
    if (error) errorHandler(error);
  }
})();