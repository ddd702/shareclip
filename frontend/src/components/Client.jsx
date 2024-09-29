import { useState, useEffect,useRef } from "react"
import { Tag,Button, Avatar, Upload } from "antd"
import { UserOutlined, UploadOutlined } from "@ant-design/icons"
import "./Client.css"

function Client({client,sendToClient}) {
    const { ip,peerId,status,isMyself} = client
    const getAvatarName = ((ip)=>{
      return ip.split('.').at(-1);
    })(ip)
    // console.log(client)
    const uploadApi = `http://${window.host}:${window.port}/upload`
    const inputRef = useRef(null);
    const submitData = ()=>{
        const data = inputRef.current.innerHTML
        sendToClient(peerId,data)
    }
    const handleUploadChange = ({file,event}) => {
      console.log(file,event)
      if(file.status === 'done'){
        const $div = document.createElement('div')
        $div.innerHTML = `<a target="_blank" style="font-size:12px;" href="${file.response.data}">附件:${file.response.data}</a>`
        inputRef.current.appendChild($div)
      }
    }
    return (
        <div className="client-list-item">
          <div className="client-list-item-header">
            <Avatar style={{ backgroundColor: status==="online"?"#f70":"grey" }}>{getAvatarName}</Avatar>
            <b className="title">{ip}</b>
            <span className="client-tag"><Tag bordered={false} color="orange">{peerId}</Tag></span>
            <span className="client-tag"><Tag bordered={false} color={status==="online"?"success":"error"}>{status}</Tag></span>
            {isMyself?<span className="client-tag"><Tag bordered={false} color="blue">me</Tag></span>:''}
          </div>
            
          {isMyself||status==="offline"?'':<div className="client-list-item-body">
              <p className="tip">You can send text and picture</p>
              <section ref={inputRef} className="paste-area" contentEditable></section>
              <Button type="primary" onClick={submitData}>Send to this user</Button>
              <Upload action={uploadApi} onChange={handleUploadChange}>
                <Button  icon={<UploadOutlined />} style={{marginLeft:'10px'}} type="dashed">Upload file</Button>
              </Upload>
              
            </div>
          }
        </div>
    )
}
export default Client;