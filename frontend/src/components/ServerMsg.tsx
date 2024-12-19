import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {QRCodeSVG} from 'qrcode.react';
import { ClipboardCopy } from 'lucide-react'
export default function ServerMsg({
  serverInfo,hostClip
}) {
  return  <div>
    <h2 className="py-2">Tips</h2>
    <p className="text-sm text-gray-500">1. You can use the QR code to scan the server's address.</p>
    <div className="bg-slate-50 rounded-lg p-2 my-3 inline-block">
      <QRCodeSVG value={`http://${serverInfo.myIpAddr}:${serverInfo.port}`} />
    </div>
    <p className="text-sm text-gray-500">2. Or you can visit the server's address by <a href={`http://${serverInfo.myIpAddr}:${serverInfo.port}`}>{`http://${serverInfo.myIpAddr}:${serverInfo.port}`}</a></p>
    <h2 className="py-2 mt-5">Text from server's clipboard</h2>
    <CopyToClipboard text={hostClip} onCopy={() => toast.success('Copied to clipboard')}>
      <Button variant="ghost" size="icon">
        <ClipboardCopy />
      </Button>
    </CopyToClipboard>
    <br/>
    <div className="text-sm  mt-3 dark:bg-slate-800 bg-slate-50 p-2 rounded-md">
      <pre className="max-w-[900px] overflow-auto">
        {hostClip}
      </pre>
    </div>
    
  </div>
}