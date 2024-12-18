import { useRef,useCallback } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/ui/sidebar"
import "./Client.css"

function Client({client, clientsInfo,onSelected,sendToClient}) {
    const {
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    } = useSidebar();
    const { ip,status,isMyself,peerId, selected} = client
    const getAvatarName = ((ip)=>{
      return ip.split('.').at(-1);
    })(ip)
    // console.log(client)
    const uploadApi = `http://${window.host}:${window.port}/upload`
    const inputRef = useRef(null);
    const submitData = ()=>{
        const data = inputRef.current.innerHTML
        sendToClient(data)
    }
    const clearData = ()=>{
      inputRef.current.innerHTML = ''
    }
    return (
      <div onClick={()=>onSelected(ip)} className={selected?"client-item selected":"client-item"}>
        <div className="flex items-center p-1">
          <div className="relative">
            {(isMobile||!open)&&!!clientsInfo[ip]?.msgCnt&&<span className="absolute p-1 leading-[1] top-0 right-[0px] w-[10px] h-[10px] rounded-full bg-[#f00] z-10"></span>}
            <Avatar className="text-[#fff]" style={{ backgroundColor: status==="online"?"#8077d8":"grey" }}>{getAvatarName}</Avatar>
          </div>
          {open?
            <>
              <span className="client-tag">{peerId}</span>
              <span className="client-tag">{status}</span>
              {isMyself?<span className="client-tag">me</span>:''}
              {(!!clientsInfo[ip]?.msgCnt)&&<Badge className="ml-2">{clientsInfo[ip]?.msgCnt}</Badge>}
            </>
            :''
          }
        </div>
      </div>
    )
}
export default Client;