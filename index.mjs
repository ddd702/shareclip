#!/usr/bin/env node

import { createServer } from 'node:http';
import path from 'node:path';
import querystring from 'node:querystring';
import {fileURLToPath} from 'node:url';
import clipboard from 'clipboardy';
import ejs from 'ejs';
import { argv } from 'node:process';
import fs from 'fs-extra';
import ip from 'ip';
import { PassThrough } from 'node:stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const myIpAddr = ip.address();
const port = argv[2]||7080;
const storagePath = path.join(__dirname, 'storage','index.json');// save client write clipboard to storage.json
fs.writeFile(storagePath, JSON.stringify([]));// 默认清空或创建storage/index.json

createServer((req, res) => {
  const stream = new PassThrough(); // Create a new stream, for send message to client
  res.setHeader('Content-Type', 'text/html');
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const readClip = clipboard.readSync();
  if (req.url === '/') {
    const indexPath = path.join(__dirname, 'index.html');
    let html = ejs.render(fs.readFileSync(indexPath).toString(), {ip: myIpAddr, port, clientIp});
    res.end(html);
  }
  else if (req.url === '/clipboard') {
    res.setHeader('Content-Type', 'text/plain');
    if (readClip) {
      res.end(readClip);
    }else{
      res.end('Clipboard is empty');
    }
  }
  else if (req.url === '/clipboard/stream') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    stream.pipe(res); // Pipe the stream to the response
    stream.on('close', () => {
      console.log('client closed');
      stream.write(`data: end\n\n`);
      id = 0;
      res.end();
    });
  }
  else if (req.url === '/clipboard/write'&&req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const postData = querystring.parse(body);
      const storageContent = (()=>{
        try {
          return JSON.parse(fs.readFileSync(storagePath, 'utf8'))
        }catch (e) {
          return [];
        }
      })();
      storageContent.push({ip:clientIp,clip:postData.clip});
      fs.writeFileSync(storagePath, JSON.stringify(storageContent));
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify({data:true}));
      res.end();
    })
   
  }
  else {
    res.statusCode = 404;
    const htmlPath = path.join(__dirname, '404.html');
    res.end(fs.readFileSync(htmlPath));
  }

  
}).listen(port, '0.0.0.0');
console.log(`Server running at http://0.0.0.0:${port}/ \nor http://${myIpAddr}:${port}/`);


