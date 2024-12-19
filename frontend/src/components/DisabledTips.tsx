export default function DisabledTips({ children }) {
  return <div className="disabled-tips">
    <div className="disabled-tips__title">
      { children || 'This feature is disabled' }
    </div>
  </div>
}