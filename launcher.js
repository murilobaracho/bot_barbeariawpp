const { exec } = require('child_process');
const path = require('path');

const botPath = path.join(__dirname, 'index.js');

exec(`node "${botPath}"`, (error) => {
  if (error) {
    console.log(error);
  }
});