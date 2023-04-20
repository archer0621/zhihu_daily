import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

/* 引入antd-mobile */
import { ConfigProvider } from 'antd-mobile'
import zhCN from 'antd-mobile/es/locales/zh-CN'

/* REM */
import 'lib-flexible'

/* 引入样式 */
import './index.less'

/* REDUX */
import { Provider } from 'react-redux'
import store from './store'

/* 处理最大宽度 */
;(function () {
  const handleMax = function handleMax() {
    let html = document.documentElement,
      root = document.getElementById('root'),
      deviceW = html.clientWidth
    root.style.maxWidth = '750px'
    if (deviceW >= 750) {
      html.style.fontSize = '75px'
    }
  }
  handleMax()
})()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ConfigProvider locale={zhCN}>
    <Provider store={store}>
      <App />
    </Provider>
  </ConfigProvider>
)
