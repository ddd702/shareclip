import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function isFileSync(inPath) {
  try {
    const stats = fs.statSync(inPath);
    return stats.isFile();
  } catch (err) {
    return false;
  }
}
export function getFileExt (filePath) {
  const extname = path.extname(filePath);
  return extname;
}
export const randStr = (num=10)=>{
  function randomString(length, chars) {
    let result = '';
    for (let i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
  return randomString(
    num,
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  );
}
export function render404(res){
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 404;
  const htmlPath = path.join(__dirname, '404.html');
  res.end(fs.readFileSync(htmlPath));
}

export function getFileMime (filePath) {
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
      '.json': 'application/json',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      // ... 其他 MIME 类型
    };
    return mimeTypes[extname] || 'text/plain';
}