import { useState,useEffect, useMemo } from 'react'
import dayjs from 'dayjs';
import axios from "axios";
import Viewer from 'viewerjs';
import Peer from 'peerjs';
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { Avatar } from "@/components/ui/avatar"
import { SidebarProvider, SidebarTrigger,useSidebar } from "@/components/ui/sidebar"
import AppSidebar  from "@/components/AppSidebar"
import TextInput from "@/components/TextInput"
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { randStr } from '@/lib/tools';
import Client from '@/components/client';
import DisabledTips from '@/components/DisabledTips';
import ServerMsg from '@/components/ServerMsg';
import DeviceIcon from '@/components/DeviceIcon';


import 'viewerjs/dist/viewer.css' //预览图片样式
import '@/App.css'

const baseUrl = `http://${window.host}:${window.port}`
let picViewer  = null
let inter = null
const peerId = randStr(7).toLocaleLowerCase();
let isConnected = false;
let scrollTimer = null
let currentClientIpForOut = ''//好难，startPeerConnection获取不到currentClientIp，只能在这里保存了
// localStorage.setItem('peerId',peerId)
let peer = new Peer(peerId,{
  key:'p',
  host: window.host,
  port: window.peerPort,
  path: window.peerPath,
  debug: 3,
  config:{
    iceServers:[{
      urls:'stun:stun.cloudflare.com'
    }],
    sdpSemantics: "unified-plan",
  }
})
peer.on('open',function(id){
  console.warn('my peerId',id)
})
peer.on('error', function(err){
  console.error(err)
})

function App() {
  const isMobile = useIsMobile()
  const [currentClientIp, setCurrentClientIp] = useState<''>('')
  const [clients, setClients] = useState<{ip: string, peerId: string, status: string,[key]: any}[]>([]);
  const [clientsInfo, setClientsInfo] = useState<{
    [key: string]: {
      msgCnt: number,
    }
  }>({});// {peerId: {msgCnt: number}}
  
  const [interDelay, setInterDelay] = useState(3000);
  const [hostClip, setHostClip] = useState('');
  const [serverInfo, setServerInfo] = useState({ myIpAddr:window.host, port:window.port, clientIp:'' });
  const currentClient = useMemo(() => {
    // 耗时计算
    currentClientIpForOut = currentClientIp
    document.querySelectorAll(`.msg-cell`).forEach((el) => {
      if(!el.classList.contains(`msg-${currentClientIp}`)){
        el.classList.add('hidden')
      }else{
        el.classList.remove('hidden')
      }
    })
    currentClientIp?clientsInfo[currentClientIp].msgCnt = 0:'';
    return clients.find(client => client.ip === currentClientIp)||null;
  }, [currentClientIp,clients]);
  const loopFetchHostClip = () => {
    axios.get(baseUrl+'/clipboard').then(res=>{
      setHostClip(res.data);
    })
    axios.post(baseUrl+'/clients').then(res=>{
      res.data.data.forEach(client=>{
        if(!clientsInfo[client.ip]){
          clientsInfo[client.ip] = {msgCnt:0}
        }
      })
      setClients(res.data.data);
    })
  }
  const startLoopFetch = () => {
    loopFetchHostClip();
    inter = setInterval(loopFetchHostClip, interDelay);
  }
  const sendToClient = (msg='hello') => {//设备间联动
    if(!currentClientIp){
      toast.warning('Please Choose a client');
      return
    }
    if(!msg){
      toast.warning('Please input message');
      return
    }
   
    const connection = peer.connect(currentClient.peerId,{
      reliable:true
    });
    connection.on('open',()=>{
      console.warn('Connect open ',currentClientIp);
      const sendData = {msg,ip:serverInfo.clientIp,type:"html",id:`${peerId}_${Date.now()}`,time:dayjs().format('HH:mm:ss'),peerId, to:currentClientIp};
      renderMessage(sendData,1);
      connection.send(sendData);
    })
    connection.on('error', (err) => {
      console.error('Error connecting peer:', err);
    });
  }
  const scrollToBottom = () => {
    console.log('Scroll to bottom')
   
    document.querySelector('html').scrollTop = document.querySelector('#content-main').scrollHeight;
   
  }
  const renderMessage = (data,type = 0) => {// type,0:接收的信息，1：我发的
    //至于为啥不用react的state保存，因为要渲染的内容可能有base64，内容比较大，怕内存开销大
    clearTimeout(scrollTimer);
    let shouldScroll = true;
    if(data.type==='html'){
      const targetEl = document.getElementById(`client-message`);
      const newEl = document.createElement('div');
      const msgEl = document.createElement('div');
      const timeEl = document.createElement('div');
      if(type===1){
        newEl.classList.add('client-message-send','msg-cell',`msg-${data.to}`);
      }else{
        if(!Reflect.has(clientsInfo,data.ip)){
          clientsInfo[data.ip] = { msgCnt:0 }
        }
        if(data.ip === currentClientIpForOut){
          clientsInfo[data.ip].msgCnt = 0;
        }else{
          newEl.classList.add('hidden')
          clientsInfo[data.ip].msgCnt++
          shouldScroll = false;
        }
        // setClientsInfo(clientsInfo);
        newEl.classList.add('client-message-recieve','msg-cell',`msg-${data.ip}`);
      }
      msgEl.innerHTML = data.msg;
      msgEl.classList.add('message-inner');
      timeEl.innerHTML = `<div class="time"><span>${type===1?'I ':data.ip} sent at ${data.time}</span></div>`;
      newEl.appendChild(timeEl);
      newEl.appendChild(msgEl);
      targetEl.appendChild(newEl);
      if(shouldScroll){
        let scrollTimer = setTimeout(() =>{
          scrollToBottom();
        },1000)
      }
      picViewer && picViewer.destroy();
      picViewer = new Viewer(document.querySelector('#client-message'), {
        inline: false,
      });
    }
  }
  const startPeerConnection = ()=>{
    if(isConnected){
      return;
    }
    isConnected = true;
    peer.on('connection',(conn)=>{
      conn.on('data', (data) => {
        // 收到数据
        toast.info(`Received data from ${data.ip}`)
        renderMessage(data);
      });
    })
  }
  const init = ()=>{
    axios.post(baseUrl+'/info',{peerId,ua: navigator.userAgent},{
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(res=>{
      setServerInfo(res.data.data);
    });
    clearInterval(inter);
    startLoopFetch();
    startPeerConnection();
  }
  useEffect(()=>{
    init();
    return ()=>{
      clearInterval(inter);
      peer.destroy();
    }
  },[])
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider className="w-full">
        <AppSidebar onSelectedHost={()=>setCurrentClientIp('')}  serverInfo={serverInfo} currentClientIp={currentClientIp}>
         
          {clients.map((client)=>{
              return <Client 
                onSelected={(ip)=>setCurrentClientIp(ip)} 
                sendToClient={sendToClient} 
                client={{
                  ...client,
                  selected:currentClientIp===client.ip,
                  isMyself:serverInfo.clientIp ===client.ip
                }} 
                clientsInfo = {clientsInfo}
                key={client.ip}/>
            })
          }
          
        </AppSidebar>
        <main id="content-main" className="min-h-[100svh] relative w-full flex-1 flex-col justify-between flex">
          <header className="flex bg-[var(--header-bg)] z-10 sticky top-0 left-0 items-center">
            {isMobile&&<SidebarTrigger />}
            <div className="flex-1 flex flex-col">
              <h2 className="text-sm flex items-center justify-center p-3 text-center font-bold">
                {currentClient?<>
                    <Avatar className="mr-2" style={{ backgroundColor: currentClient.status==="online"?"#7e77e2":"gray" }}>
                      <DeviceIcon ua={currentClient.ua}/>
                    </Avatar>
                    <div>
                      <p className="text-xs font-normal text-[#777]">{currentClient.peerId}</p>
                      <p>{currentClient.ip}</p>
                    </div>
                  </>:<>ShareClip - A simple clipboard or file sharing tool</>
                }
          
              </h2>
            </div>
          </header>
          <div className="flex-1 bg-[var(--message-bg)] p-2">
            <div className="client-list-item-message max-w-[600px] mx-auto" id="client-message"></div>
            <div className="max-w-[900px] mx-auto">
              {currentClientIp===serverInfo.clientIp&&<DisabledTips>
                  You can't send messages to yourself
                </DisabledTips>}
              {!currentClientIp&&<ServerMsg hostClip={hostClip} serverInfo={serverInfo}/>}
            </div>
          </div>
          <footer
            className={(currentClient&&currentClient.status==="online"&&currentClient.ip!==serverInfo.clientIp)?"app-footer":"hidden"}>
            <TextInput sendToClient={sendToClient}/>
          </footer>
        </main>
      </SidebarProvider>
      <Toaster position="top-right"/>
    </ThemeProvider>
  )
}

export default App
