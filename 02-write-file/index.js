const { createWriteStream } = require('fs');
const { createInterface } = require('readline');
const { join } = require('path');

const { stdin, stdout, stderr } = process;

const conColors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  yellow: '\x1b[33m',
};

const fileName = 'text.txt';
const filePath = join(__dirname, fileName);

const writeStream = createWriteStream(filePath, 'utf8');
writeStream.on('error', error => {
  stderr.write(`\n${conColors.red}Error ${error.message}`);
  rl.close();
  process.exit(1);
});

const colorize = (string, colorStart, colorEnd) => `${conColors[colorStart]}${string}${conColors[colorEnd]}`;

const rl = createInterface({
  input: stdin,
  output: stdout,
  prompt: colorize('>> ', 'blue', 'white'),
});

const farewell = () => {
  stdout.write(`${colorize('\nThe entered text was saved into a file ', 'blue', 'yellow')}'${filePath}'`);
  rl.close();
};

rl.write(`${colorize('Please enter the text. To save the text to the', 'blue', 'yellow')} '${fileName}'${colorize(',\nenter the', 'blue', 'green')} 'exit' ${colorize('command or press', 'blue', 'green')} < Ctrl+C >\n`);
rl.prompt();
rl.on('SIGINT', farewell);
rl.on('line', input => {
  if (input.trim().toUpperCase() !== 'EXIT') {
    writeStream.write(input + '\n');
    rl.prompt();
  }
  else
    farewell();
}
);