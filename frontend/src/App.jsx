import { useState,useEffect } from 'react'
import { Button,ConfigProvider,message, Drawer, Collapse } from 'antd';
import { SettingOutlined, CopyOutlined } from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import axios from "axios";
import { randStr } from './utils';
import Peer from 'peerjs';

import './App.css'

const baseUrl = `http://${window.host}:${window.port}`

let inter = null;
const peerId = randStr(8);
let peer = new Peer(peerId,{
  key:'p',
  host: window.host,
  port: window.peerPort,
  path: window.peerPath,
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
    
    
    return ()=>{
      clearInterval(inter);
    }
  },[])
  return (
    <ConfigProvider>
      <main className="app">
        <div className="device-list">
          <div className="device-list-item">
            <div className="device-list-item-header">
              <b className="title">Host ClipBord Text</b>
              <CopyToClipboard text={hostClip} onCopy={()=>message.success('Copied to clipboard!')}>
                <span title="click to copy" className="cursor-pointer" style={{paddingLeft:'10px'}}><CopyOutlined /></span>
              </CopyToClipboard>
            </div>
            <div className="device-list-item-content">
              <pre>{hostClip}</pre>
            </div>
          </div>
          {clients.map((client)=>{
              return (
                <div className="device-list-item" key={client.ip}>
                  <div className="device-list-item-header">
                    <b className="title">{client.ip}</b>
                    <span>{client.status}</span>
                    <span>{(serverInfo.clientIp ===client.ip?'myself':'')}</span>
                  </div>
                </div>
              )
            })
          }
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
