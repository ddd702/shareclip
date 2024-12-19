import { Button } from '@/components/ui/button'
import { getFileInput,byteConvert } from '@/lib/tools'
import { Send, Eraser, Paperclip } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
function Loading(){
  return (<span className="text-sm px-2">loading</span>)
}

export default function TextInput({
  sendToClient,
}){
  const inputRef = useRef(null); // 获取输入框的引用
  const fileInp = getFileInput('app');
  const [loading,setLoading] = useState(false)
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
    setLoading(true)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('size',byteConvert(file.size));
    const res = await fetch(uploadApi,{
      method: 'POST',
      body: formData
    })
    const response = await res.json().finally(()=>setLoading(false))
    if(response.data){
      const $div = document.createElement('span')
      $div.innerHTML = `<a onclick="window.open('${response.data}', '_blank')" title="${response.data}"  style="font-size:14px; background:var(--paperclip-bg); padding:5px; margin:5px;border-radius:5px; display:inline-block;" href="javascript:void(0)">
        <span style="background-size:100% 100%;display:inline-block;background:url(/dist/paperclip.svg) no-repeat 0 0;color:#fff;width:24px;height:24px;"></span>
        <span style="color:#fff">${response.name}</span>
        <span style="color:#ddd; font-size:12px;">${response.size}</span>
      </a>`
      inputRef.current.appendChild($div)
    }else{
      toast.error(response.message||'upload error')
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
        <section ref={inputRef} className="paste-area  flex-1" contentEditable></section>{
          loading?<Loading/>:<>
           <Button size="icon" className="ml-1" variant="ghost" onClick={submitData}>
              <Send />
            </Button>
            <Button size="icon" className="ml-1" onClick={openUpload} variant="ghost">
              <Paperclip />
            </Button>
            <Button size="icon" className="ml-1" variant="ghost" onClick={clearData}>
              <Eraser />
            </Button>
          </>
        }
       
      </div>
    </div>
  )
}