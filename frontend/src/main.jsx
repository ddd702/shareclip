import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
//程序加载就询问是否允许获取剪贴板信息
navigator.permissions.query({ name: "geolocation" }).then((result) => {
  if (result.state === "granted") {
    showLocalNewsWithGeolocation();
  } else if (result.state === "prompt") {
    showButtonToEnableLocalNews();
  }
  // 如果拒绝授予此权限则什么也不做。
});

createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>,
)
