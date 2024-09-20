#!/usr/bin/env node

import { createServer } from 'node:http';
import path from 'node:path';
import querystring from 'node:querystring';
import {fileURLToPath} from 'node:url';
import { PassThrough } from 'node:stream';
import { argv } from 'node:process';
import clipboard from 'clipboardy';
import { PeerServer } from 'peer';
import fs from 'fs-extra';
import ip from 'ip';
import dayjs from 'dayjs';
import axios from 'axios';
import { isFileSync, getFileMime, render404 } from './tools.mjs';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const myIpAddr = ip.address();
const port = argv[2]||7080;
const peerPath = '/peer';
const peerKey = 'p';
const peerPort = port+1;
const storagePath = path.join(__dirname, 'storage','index.json');// save client write clipboard to storage.json
const clients = [];// save client info
//fs.writeFile(storagePath, JSON.stringify([]));// 默认清空或创建storage/index.json

fs.writeFileSync(path.join(__dirname, './frontend/dist/s.js'), `window.port="${port}";window.host="${myIpAddr}";window.peerPath="${peerPath}";window.peerPort="${peerPort}"`, 'utf8');
fs.writeFileSync(path.join(__dirname, './frontend/public/s.js'), `window.port="${port}";window.host="${myIpAddr}";window.peerPath="${peerPath}";window.peerPort="${peerPort}"`, 'utf8');

createServer(async (req, res) => {
  // console.log(`serving ${req.url}`); // log request path
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST'); // 允许 POST 请求
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 
  const reqPath = req.url.split('?')[0];
  const stream = new PassThrough(); // Create a new stream, for send message to client
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const readClip = clipboard.readSync();
  if (reqPath === '/') {
    const indexPath = path.join(__dirname, './frontend/dist/index.html');
    res.end(fs.readFileSync(indexPath));
  }
  else if (reqPath === '/info'&&(req.method === 'POST'||req.method === 'OPTIONS')) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const postData = querystring.parse(body);
      res.setHeader('Content-Type', 'application/json');
      if(clients.length > 0){
        clients.forEach(client =>{
          if(client.ip === clientIp){
            client.updateTime = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            client.peerId = postData.peerId;
          }
        })
      }
      if(!clients.find((client) => client.ip === clientIp)) {
        clients.push({
          ip: clientIp,
          peerId: postData.peerId,
          updateTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
          createTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
        });
      }
      res.write(JSON.stringify({data:{
        clientIp,
        myIpAddr,
        postData,
        peerId: postData.peerId,
        port,
        peerPort,
        peerPath,
      }}));
      res.end();
    });
  }
  else if (reqPath === '/clipboard') {
    res.setHeader('Content-Type', 'text/plain');
    if (readClip) {
      res.end(readClip);
    }else{
      res.end('Clipboard is empty');
    }
  }
  else if (reqPath === '/clients'&&(req.method === 'POST'||req.method === 'OPTIONS')) {
    if(req.method === 'POST'){
      axios.get(`http://localhost:${peerPort}${peerPath}/${peerKey}/peers`).then(({data = []})=>{
        clients.forEach((client)=>{
          if(data.includes(client.peerId)){
            client.status = 'online'
          }else{
            client.status = 'offline'
          }
        })
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({data: clients}));
        res.end();
      })
    }
   
    // res.end();
  }
  else if (reqPath === '/clipboard/stream') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    stream.pipe(res); // Pipe the stream to the response
    stream.on('close', () => {
      console.log('client closed');
      stream.write(`data: end\n\n`);
      id = 0;
      res.end();
    });
  }
  else if (reqPath === '/clipboard/write'&&req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const postData = querystring.parse(body);
      console.log(postData);
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
  else if (reqPath === '/clipboard/read'&&req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const postData = querystring.parse(body);
      const storageContent = (()=>{
        try {
          const content = fs.readFileSync(storagePath, 'utf8').toString();
          return content;
        }catch (e) {
          return [];
        }
      })();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({data:storageContent}));
    })
   
  }
  else if (/^\/dist\/*/.test(reqPath)) {
    const filePath = path.join(path.join(__dirname, `./frontend/${reqPath}`));
    if(!isFileSync(filePath)){
      render404(res);
      return
    }else{
      res.setHeader('Content-Type', getFileMime(filePath));
      fs.createReadStream(filePath).pipe(res);
    }
  }
  else {
    render404(res);
  }
}).listen(port, '0.0.0.0');
const peeServer = PeerServer({path:peerPath, port: peerPort, key:peerKey, allow_discovery: true});
console.log(`Server running at http://0.0.0.0:${port}/ \nor http://${myIpAddr}:${port}/\npeerSever running at http://${myIpAddr}:${port+1}/peer`);


