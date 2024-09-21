import { useState, useEffect,useRef } from "react"
import { Tag,Button, Avatar } from "antd"
import { UserOutlined } from "@ant-design/icons"
import "./Client.css"

function Client({client,sendToClient}) {
    const { ip,peerId,status,isMyself} = client
    // console.log(client)
    const inputRef = useRef(null);
    const submitData = ()=>{
        const data = inputRef.current.innerHTML
        sendToClient(peerId,data)
    }
    return (
        <div className="client-list-item">
          <div className="client-list-item-header">
            <Avatar style={{ backgroundColor: status==="online"?"#87d068":"grey" }} icon={<UserOutlined />} />
            <b className="title">{ip}</b>
            <span className="client-tag"><Tag bordered={false} color="orange">{peerId}</Tag></span>
            <span className="client-tag"><Tag bordered={false} color={status==="online"?"success":"error"}>{status}</Tag></span>
            {isMyself?<span className="client-tag"><Tag bordered={false} color="blue">me</Tag></span>:''}
          </div>
            
          {isMyself||status==="offline"?'':<div className="client-list-item-body">
              <p className="tip">You can send text and picture</p>
              <section ref={inputRef} className="paste-area" contentEditable></section>
              <Button type="primary" onClick={submitData}>Send to this user</Button>
            </div>
          }
        </div>
    )
}
export default Client;