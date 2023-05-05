const { mkdir, readdir } = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');
const { join, extname } = require('path');
const { pipeline } = require('stream/promises');

const sourceDirName = 'styles';
const destDirName = 'project-dist';
const destFileName = 'bundle.css';
const sourceDir = join(__dirname, sourceDirName);
const destDir = join(__dirname, destDirName);

const charset = 'utf-8';

const { stdout, stderr } = process;

const conColors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

const colorize = (string, colorStart, colorEnd) => `${conColors[colorStart]}${string}${conColors[colorEnd]}`;

const errorHandler = (error) => {
  stderr.write(`${conColors.red}Error ${error.message}`);
  process.exit(1);
};

const createCssBundle = async (sourceCssDir, destCssFileName) => {
  try {
    let cssFileNum = 0;
    const destFile = join(__dirname, destDirName, destCssFileName);
    const writeStream = createWriteStream(destFile, { flags: 'w' });
    const filesAndDirs = await readdir(sourceCssDir, { withFileTypes: true });
    const styleFiles = filesAndDirs.filter(file => file.isFile() && extname(file.name).toUpperCase() === '.CSS').map(file => file.name);
    for (const styleFile of styleFiles) {
      const sourceFile = join(sourceCssDir, styleFile);
      const readStream = createReadStream(sourceFile, charset);
      readStream.once('end', () => {
        writeStream.write('\n');
        stdout.write(`${colorize(`'${styleFile}'`, 'yellow', 'blue')} file added to the CSS bundle\n`);
      });
      await pipeline(readStream, writeStream, { end: false });
      cssFileNum++;
    }
    stdout.write(`\n${colorize(`${cssFileNum}`, 'yellow', 'blue')} CSS files are added to the ${colorize(`'${destCssFileName}'`, 'yellow', 'blue')}\n`);
  }
  catch (error) {
    if (error) errorHandler(error);
  }
};

(async () => {
  try {
    await mkdir(destDir, { recursive: true });
    stdout.write(`${colorize(`'${destDirName}'`, 'green', 'blue')} directory created\n`);
    await createCssBundle(sourceDir, destFileName);
  }
  catch (error) {
    if (error) errorHandler(error);
  }
})();