const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const { Transform } = require('stream');
const url = require('url');
const path = require('path');

const VALID_AUTH = 'Bearer ekV5Rk4wMlgvYVpCbmp5WUh5bHVPMktwMzktY05QeDRjT3FlWlNiUTJhbVpraHc5d3Y5a3YtU2pM';

const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    console.log(`Запит отримано: ${req.method} ${parsedUrl.pathname}`);

    if (parsedUrl.pathname === '/task1' && req.method === 'GET') {
        const aHeader = req.headers['authorization'];

        if (aHeader === VALID_AUTH) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('You are welcome!');
        } else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Who are you???');
        }
    } 
    else if (parsedUrl.pathname === '/task2' && req.method === 'POST') {
        let chunks = [];
        req.on('data', (chunk) => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            zlib.gunzip(buffer, (err, decompressedData) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error decompressing file');
                    return;
                }

                const filePath = path.join(UPLOAD_DIR, 'file.txt');
                fs.writeFile(filePath, decompressedData, (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error saving file');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('File successfully received and saved');
                });
            });
        });
    }
    else if (parsedUrl.pathname === '/task3' && req.method === 'GET') {
        const query = parsedUrl.query;
        const text = query && query.text ? query.text : '';

        class CustomStream extends Transform {
            _transform(chunk, encoding, callback) {
                const transformedChunk = chunk.toString().toUpperCase();
                this.push(transformedChunk);
                callback();
            }
        }

        const customStream = new CustomStream();
        let output = '';

        customStream.write(text, 'utf-8');
        customStream.end();

        customStream.on('data', (chunk) => {
            output += chunk.toString();
        }).on('end', () => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`success\n\n${output}`);
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(8000, () => {
    console.log('Server running at http://localhost:8000/task1');
    console.log('Server running at http://localhost:8000/task2');
    console.log('Server running at http://localhost:8000/task3');
});
