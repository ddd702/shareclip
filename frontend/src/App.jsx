import { useState,useEffect } from 'react'
import { Button,ConfigProvider,message, Drawer, Card } from 'antd';
import { SettingOutlined, CopyOutlined } from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import axios from "axios";
import { randStr } from './utils';
import Peer from 'peerjs';
import Client from './components/client';

import './App.css'
import dayjs from 'dayjs';


const baseUrl = `http://${window.host}:${window.port}`

let inter = null
const peerId = randStr(8).toLocaleLowerCase();
let peer = new Peer(peerId,{
  key:'p',
  host: window.host,
  port: window.peerPort,
  path: window.peerPath,
})
peer.on('open',function(id){
  console.warn('my peerId',id)
})
function App() {
  const prefersDarkScheme = window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');
  const [isDarkMode, setIsDarkMode] = useState(prefersDarkScheme);
  const [settingOpen, setSettingOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [interDelay, setInterDelay] = useState(5000);
  const [hostClip, setHostClip] = useState('');
  const [serverInfo, setServerInfo] = useState({ myIpAddr:window.host, port:window.port, clientIp:'' });
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const onDrawerToggle = () => {
    setSettingOpen(!settingOpen);
  };
  const loopFetchHostClip = () => {
    axios.get(baseUrl+'/clipboard').then(res=>{
      setHostClip(res.data);
    })
    axios.post(baseUrl+'/clients').then(res=>{
      setClients(res.data.data);
    })
  }
  const startLoopFetch = () => {
    loopFetchHostClip();
    inter = setInterval(loopFetchHostClip, interDelay);
  }
  const sendToClient = (id, msg='hello') => {//设备间联动
    if(!msg){
      message.warning('Please input message');
      return
    }
    const conn = peer.connect(id);
    console.warn('Connect',id,conn)
    conn.on('open',()=>{
      console.warn('Connect open')
      const sendData = {msg,ip:serverInfo.clientIp,type:"html",id:`${peerId}_${Date.now()}`,time:dayjs().format('HH:mm:ss'),peerId};
      renderMessage(sendData,1);
      conn.send(sendData);
    })
    conn.on('error', (err) => {
      console.error('Error connecting peer:', err);
    });
  }
  const renderMessage = (data,type = 0) => {// type,0:接收的信息，1：我发的
    if(data.type==='html'){
      const targetEl = document.getElementById(`client-message`);
      const newEl = document.createElement('div');
      const msgEl = document.createElement('div');
      const timeEl = document.createElement('div');
      if(type===1){
        newEl.classList.add('client-message-send');
      }else{
        newEl.classList.add('client-message-recieve');
      }
      msgEl.innerHTML = data.msg;
      msgEl.classList.add('message-inner');
      timeEl.innerHTML = `<div class="time"><span>${type===1?'I ':data.ip} sent at ${data.time}</span></div>`;
      newEl.appendChild(timeEl);
      newEl.appendChild(msgEl);
      targetEl.appendChild(newEl);
    }
  }
  useEffect(()=>{
    document.body.classList.toggle('dark', isDarkMode);
  },[isDarkMode])
  useEffect(()=>{
    axios.post(baseUrl+'/info',{peerId},{
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(res=>{
      setServerInfo(res.data.data);
    });
    clearInterval(inter);
    startLoopFetch();
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === 'visible') {
        console.log('page show');
        startLoopFetch();
      } else {
        console.log('page hidden');
        clearInterval(inter);
      }
    });
    peer.on('connection',(conn)=>{
      conn.on('data', (data) => {
        // 收到数据
        message.info(`Received data from ${data.ip}`)
        renderMessage(data);
      });
    })
    return ()=>{
      clearInterval(inter);
    }
  },[])
 
  return (
    <ConfigProvider>
      <main className="app">
        <div className="client-box">
          <section className="clinet-box-inner">
          
            {clients.map((client)=>{
                return <Client sendToClient={sendToClient} client={{...client,isMyself:serverInfo.clientIp ===client.ip}} key={client.ip}/>
              })
            }
          </section>
        </div>
        <div className="message-box">
          <div className="client-list-item">
            <div className="client-list-item-header">
              <b className="title">Host ClipBord Text</b>
              <CopyToClipboard text={hostClip} onCopy={()=>message.success('Copied to clipboard!')}>
                <span title="click to copy" className="cursor-pointer"><CopyOutlined /></span>
              </CopyToClipboard>
            </div>
            <div className="client-list-item-body">
              <div className="client-list-item-content">
                <pre>{hostClip}</pre>
              </div>
            </div>
          </div>
          <div className="client-list-item-header">
            <span className="title">Message from other client</span>
          </div>
          <div className="client-list-item-message" id="client-message"></div>
        </div>
        <div className="setting-btn" onClick={onDrawerToggle}>
          <SettingOutlined />
        </div>
        <Drawer title="Setting" onClose={onDrawerToggle} open={settingOpen}>
          <div className='control-panel'>
            <section>
              <div>
                <b className="title">My Ip</b>
                <p>{serverInfo.clientIp}</p>
              </div>
              <div>
                <b className="title">Host URL</b>
                <p>http://{serverInfo.myIpAddr}:{serverInfo.port}</p>
              </div>
              <div>
                <b className="title">Version</b>
                <p>{window.appVersion}</p>
              </div>
            </section>
            <Button type="primary" size="small" block shape="round" onClick={toggleDarkMode}>
              theme:{isDarkMode?'dark':'light'}
            </Button>
          </div>
        </Drawer>
      </main>
      
    </ConfigProvider>
  )
}

export default App
