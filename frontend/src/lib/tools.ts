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
export function getFileInput(id = randStr(5), isFolder = false) {
  const $elId = `upload-file-input-${id}`;
  if(document.querySelector(`#${$elId}`)){
    return document.querySelector(`#${$elId}`);
  } 
  const input = document.createElement("input");
  input.type = "file";
  input.id = $elId;
  
  if (isFolder) {
      input.id = `upload-folder-input-${id}`;
      input.setAttribute("webkitdirectory", "true");
      input.setAttribute("mozdirectory", "true");
  } else {
      input.id = `upload-file-input-${id}`;
      input.multiple = true;
  }
  input.hidden = true;
  document.body.appendChild(input);
  return input;
}
export  function byteConvert(bytes, isObj) {
  if (bytes < 1000) return bytes + 'B';
  const k = 1024; // 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = 0;
  i = Math.floor(Math.log(bytes) / Math.log(k));
  const str = parseFloat((bytes / Math.pow(k, i)).toPrecision()).toFixed(2) + ' ' + sizes[i];
  if(isObj){
    return {
      value: parseFloat((bytes / Math.pow(k, i)).toPrecision()).toFixed(2),
      unit: sizes[i],
      str
    }
  }else{
    return str
  }
  
}