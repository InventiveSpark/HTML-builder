const { rm, mkdir, readdir, readFile } = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');
const { join, extname, sep } = require('path');
const { pipeline } = require('stream/promises');

const destDirName = 'project-dist';
const destDir = join(__dirname, destDirName);

const sourceCssDirName = 'styles';
const destCssFileName = 'style.css';
const sourceCssDir = join(__dirname, sourceCssDirName);

const sourceHtmlFileName = 'template.html';
const sourceHtmlDirName = 'components';
const sourceHtmlDir = join(__dirname, sourceHtmlDirName);
const destHtmlFileName = 'index.html';

const assetsDirName = 'assets';
const sourceAssetsDir = join(__dirname, assetsDirName);
const destAssetsDir = join(destDir, assetsDirName);

let dirNum = 0;
let fileNum = 0;

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
    stdout.write(`${colorize(`${cssFileNum}`, 'yellow', 'blue')} CSS files are added to the ${colorize(`'${destCssFileName}'`, 'yellow', 'blue')}\n\n`);
  }
  catch (error) {
    if (error) errorHandler(error);
  }
};

const createHtmlFile = async (sourceHtmlDir, sourceHtmlFileName, destHtmlFileName) => {
  try {
    let templatesNum = 0;
    const sourceFile = join(__dirname, sourceHtmlFileName);
    const destFile = join(__dirname, destDirName, destHtmlFileName);
    const writeStream = createWriteStream(destFile, { flags: 'w' });
    let htmlContent = await readFile(sourceFile, charset);
    const templateTagRegExp = RegExp(/{{\w*}}/, 'gi');
    const templateTagNameRegExp = RegExp(/[{}]/, 'gi');
    const templateTagNames = htmlContent.match(templateTagRegExp).map(templateTag => templateTag.replace(templateTagNameRegExp, ''));
    for (const templateTagName of templateTagNames) {
      const templateFileName = `${templateTagName}.html`;
      const templateFile = join(sourceHtmlDir, templateFileName);
      const templateFileContent = await readFile(templateFile, charset);
      htmlContent = htmlContent.replace(RegExp(`{{${templateTagName}}}`, 'i'), `\n${templateFileContent}`);
      templatesNum++;
      stdout.write(`${colorize(`'${templateFileName}'`, 'yellow', 'blue')} file added to the HTML file\n`);
    }
    writeStream.write(htmlContent);
    stdout.write(`${colorize(`${templatesNum}`, 'yellow', 'blue')} template tags are added to the ${colorize(`'${destHtmlFileName}'`, 'yellow', 'blue')}\n`);
  }
  catch (error) {
    if (error) errorHandler(error);
  }
};

(async () => {
  try {
    await rm(destDir, { recursive: true, force: true });
    await mkdir(destDir, { recursive: true });
    stdout.write(`${colorize(`'${destDirName}'`, 'green', 'blue')} directory created\n`);
    await copyDir(sourceAssetsDir, destAssetsDir);
    stdout.write(`${colorize(`${dirNum}`, 'green', 'blue')} directories and ${colorize(`${fileNum}`, 'yellow', 'blue')} files are copied\n\n`);
    await createCssBundle(sourceCssDir, destCssFileName);
    await createHtmlFile(sourceHtmlDir, sourceHtmlFileName, destHtmlFileName);
  }
  catch (error) {
    if (error) errorHandler(error);
  }
})();