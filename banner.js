const chalk = require('chalk');

function displayBanner() {
  console.clear();
  
  const cyan = chalk.hex('#00FFFF');
  const blue = chalk.hex('#1E90FF');
  const white = chalk.white.bold;
  
  console.log(cyan(' _    _____    ____  ___    ____  __ __    __________  ____  __   _____'));
  console.log(blue('| |  / /   |  / __ \\/   |  / __ \\/ //_/   /_  __/ __ \\/ __ \\/ /  / ___/'));
  console.log(blue('| | / / /| | / /_/ / /| | / /_/ / ,<       / / / / / / / / / /   \\__ \\ '));
  console.log(white('| |/ / ___ |/ ____/ ___ |/ _, _/ /| |     / / / /_/ / /_/ / /______/ / '));
  console.log(white('|___/_/  |_/_/   /_/  |_/_/ |_/_/ |_|    /_/  \\____/\\____/_____/____/  '));
  console.log('');
  console.log('');
}

module.exports = { displayBanner };
