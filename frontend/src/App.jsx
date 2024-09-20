import { useState,useEffect } from 'react'
import { Button,ConfigProvider,message, Drawer } from 'antd';
import { CloudFilled, SettingOutlined } from '@ant-design/icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Peer from 'peerjs';
import axios from "axios";

import './App.css'

const baseUrl = `http://${window.host}:${window.port}`

let inter = null;
function App() {
  const prefersDarkScheme = window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');
  const [isDarkMode, setIsDarkMode] = useState(prefersDarkScheme);
  const [settingOpen, setSettingOpen] = useState(false);
  const [hostClip, setHostClip] = useState('');
  const [serverInfo, setServerInfo] = useState({ myIpAddr:window.host, port:window.port, clientIp:'' });
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const onDrawerToggle = () => {
    setSettingOpen(!settingOpen);
  };
  const loopFetchHostClip = () => {
    axios.get('http://192.168.10.156:7080/clipboard').then(res=>{
      setHostClip(res.data);
    })
    axios.post(baseUrl+'/clients').then(res=>{
      
    })
  }

  // setInterval(()=>{loopFetchHostClip()}, 1000);
  useEffect(()=>{
    console.log('useEffect',serverInfo)
    document.body.classList.toggle('dark', isDarkMode);
    axios.post(baseUrl+'/info').then(res=>{
      setServerInfo(res.data.data);
    });
    clearInterval(inter);
    loopFetchHostClip();
    inter = setInterval(()=>{loopFetchHostClip()}, 5000);
    return ()=>{
      clearInterval(inter);
    }
  },[isDarkMode])
  return (
    <ConfigProvider>
      <main className="app">
        <div className="device-list">
          <section>
            <div><b>My Ip</b><p>{serverInfo.clientIp}</p></div>
            <div><b>Server URL</b><p>http://{serverInfo.myIpAddr}:{serverInfo.port}</p></div>
          </section>
          <div className="device-list-item">
            <b className="device-list-item-title">Host ClipBord Text</b>
            <div className="device-list-item-content">
              <CopyToClipboard text={hostClip} onCopy={()=>message.success('Copied to clipboard!')}>
                <pre style={{cursor:'pointer'}} >{hostClip}</pre>
              </CopyToClipboard>
            </div>
          </div>
        </div>
        <div className="setting-btn" onClick={onDrawerToggle}>
          <SettingOutlined />
        </div>
        <Drawer title="Setting" onClose={onDrawerToggle} open={settingOpen}>
          <div className='control-panel'>
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
