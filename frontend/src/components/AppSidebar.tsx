import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { BadgeInfo } from 'lucide-react';
import ToggleTheme from "@/components/ToggleTheme";
import { toast } from "sonner"
function InfoComponent({serverInfo}) {
  return (<>
        <div className="text-xs">
          ver:
          <p className="text-sm">{window.appVersion}</p>
        </div>
        <div className="text-xs my-3">
          my ip:
          <p className="text-sm">{serverInfo.clientIp}</p>
        </div>
        <div className="text-xs">
          github:
          <p className="text-sm"><a href="https://github.com/ddd702/shareclip" target="_blank">https://github.com/ddd702/shareclip</a></p>
        </div>
      </>
  )
}
export default function AppSidebar({serverInfo,children}) {
  const { open,isMobile } = useSidebar()
  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader>
        {!isMobile&&<SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent className="p-1">
        {children}

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
