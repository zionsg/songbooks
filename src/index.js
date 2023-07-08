const childProcess = require('child_process');
const http = require('http');

let app = http.createServer((request, response) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end('Hello World!');
});

// Start server
app.listen(3000, '127.0.0.1');

// Test to see if user can access GitHub repository - this will prompt for passphrase in terminal if SSH key has it
let buffer = childProcess.execSync('git ls-remote --heads git@github.com:zionsg/songbooks.git');
console.log(buffer.toString()); // eslint-disable-line no-console
