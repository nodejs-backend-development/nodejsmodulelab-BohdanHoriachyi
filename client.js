const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const filePath = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop', 'file.txt');
const compressedFilePath = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop', 'file.gz');

console.log(`Шлях до файлу: ${filePath}`);

fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
        console.error(`Файл не знайдено: ${filePath}`);
        return;
    }

    fs.createReadStream(filePath)
        .pipe(zlib.createGzip())
        .pipe(fs.createWriteStream(compressedFilePath))
        .on('finish', () => {
            console.log(`Файл стиснено: ${compressedFilePath}`);

            const options = {
                hostname: 'localhost',
                port: 8000,
                path: '/task2',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            };

            const req = http.request(options, (res) => {
                console.log(`STATUS: ${res.statusCode}`);
                res.on('data', (chunk) => {
                    console.log(`BODY: ${chunk}`);
                });
            });

            fs.createReadStream(compressedFilePath).pipe(req);
        });
});
