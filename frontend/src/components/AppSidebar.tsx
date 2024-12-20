import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"
import { Avatar } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { BadgeInfo,PcCase } from 'lucide-react';
import ToggleTheme from "@/components/ToggleTheme";
import { toast } from "sonner"
function InfoComponent({serverInfo}) {
  return (<>
        <div className="text-xs">
          Ver:
          <p className="text-sm">{window.appVersion}</p>
        </div>
        <div className="text-xs my-3">
          My ip:
          <p className="text-sm">{serverInfo.clientIp}</p>
        </div>
        <div className="text-xs">
          Github:
          <p className="text-sm"><a href="https://github.com/ddd702/shareclip" target="_blank">https://github.com/ddd702/shareclip</a></p>
        </div>
      </>
  )
}
export default function AppSidebar({serverInfo,onSelectedHost,currentClientIp,children}) {
  const { open,isMobile } = useSidebar()

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader>
        {!isMobile&&<SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent className="p-1">
        {open&&<SidebarGroupLabel>Server</SidebarGroupLabel>}
        <SidebarMenu>
          <SidebarMenuItem onClick={onSelectedHost} className={`${!currentClientIp?"selected":""} p-1 client-item flex text-sm cursor-pointer items-center`}>
            <Avatar className="bg-[var(--dialog-bg)] mr-1">
              <PcCase />
            </Avatar>
            {open&&<span>{serverInfo.myIpAddr}:{serverInfo.port}</span>}
          </SidebarMenuItem>
        </SidebarMenu>
        {open&&<SidebarGroupLabel>Clients</SidebarGroupLabel>}
        <SidebarMenu>
          {children}
        </SidebarMenu>

      </SidebarContent>
      <SidebarFooter >
        <ToggleTheme />
        
        <div className="text-sm justify-center flex items-center gap-2">
          
          {open?
            (<div className="text-xs">
              <InfoComponent serverInfo={serverInfo} />
            </div>):
            (
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <BadgeInfo className="w-[1rem]"></BadgeInfo>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <InfoComponent serverInfo={serverInfo} />
                </PopoverContent>
              </Popover>
            )
          }
          
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
