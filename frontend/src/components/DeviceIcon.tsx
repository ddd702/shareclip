import { useDeviceSelectors } from 'react-device-detect';

export default function DeviceIcon({ua}) {
  const [selectors] = useDeviceSelectors(ua)
  const { isMobile, isAndroid, isTablet, isMacOs,isIOS, isWindows, isDesktop } = selectors
  const svgSrc = (()=>{
    if (isAndroid) return '/dist/phoneAndroid.svg'
    if (isIOS) return  '/dist/iphone.svg'
    if (isMacOs) return '/dist/macOS.svg'
    return '/dist/winPc.svg'
  })()
  return (<>
    <img className="w-6" src={svgSrc} alt="device" />
  </>)
}