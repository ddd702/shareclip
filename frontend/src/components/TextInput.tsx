import { Button } from '@/components/ui/button'
import { getFileInput,byteConvert } from '@/lib/tools'
import { Send, Eraser, Paperclip } from 'lucide-react'
import { useRef, useEffect } from 'react'


export default function TextInput({
  sendToClient,
}){
  const inputRef = useRef(null); // 获取输入框的引用
  const fileInp = getFileInput('app');
  useEffect(()=>{
    const afterFileChange = (e)=>{
      const files = e.target.files
      console.log('afterFileChange',files)
      if(!files) return
      for (const file of files) {
        runUpload(file)
      }
    }
    fileInp.removeEventListener('change',afterFileChange)
    fileInp.addEventListener('change',afterFileChange)
  },[])
  const submitData = ()=>{
    const data = inputRef.current.innerHTML
    sendToClient(data)
  }
  const runUpload = async (file)=>{
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('size',byteConvert(file.size));
    const res = await fetch(uploadApi,{
      method: 'POST',
      body: formData
    })
    const response = await res.json()
    if(response.data){
      const $div = document.createElement('span')
      $div.innerHTML = `<a title="${response.data}" target="_blank" style="font-size:14px; background:var(--paperclip-bg); padding:5px; margin:5px;border-radius:5px; display:inline-block;" href="${response.data}">
        <span style="background-size:100% 100%;display:inline-block;background:url(/dist/paperclip.svg) no-repeat 0 0;color:#fff;width:24px;height:24px;"></span>
        <span style="color:#fff">${response.name}</span>
        <span style="color:#ddd; font-size:12px;">${response.size}</span>
      </a>`
      inputRef.current.appendChild($div)
    }
  }
  const clearData = ()=>{
    inputRef.current.innerHTML = '';
  }
  const openUpload = ()=>{
    fileInp.value = null
    fileInp.click()
  }
  const uploadApi = `http://${window.host}:${window.port}/upload`
  return (
    <div className="w-full h-full p-2">
      <p className="tip">You can send text and picture</p>
      <div className="flex items-center">
        <section ref={inputRef} className="paste-area  flex-1" contentEditable></section>
        <Button size="icon" className="ml-1" variant="ghost" onClick={submitData}>
          <Send />
        </Button>
        <Button size="icon" className="ml-1" onClick={openUpload} variant="ghost">
          <Paperclip />
        </Button>
        <Button size="icon" className="ml-1" variant="ghost" onClick={clearData}>
          <Eraser />
        </Button>
      </div>
    </div>
  )
}