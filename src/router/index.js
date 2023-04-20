import React, { Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import routes from './routes'
import { Mask, DotLoading } from 'antd-mobile'

/* 统一配置路由 */
const Element = function Element(props) {
  let { component: Components, meta } = props

  // 修改页面的TITLE
  let { title = '知乎日报-WebApp' } = meta || {}
  document.title = title

  // 获取路由信息,基于属性传递给组件
  const navigate = useNavigate(),
    location = useLocation(),
    params = useParams(),
    [usp] = useSearchParams()

  return <Components navigate={navigate} location={location} params={params} usp={usp} />
}

export default function RouterView() {
  return (
    <Suspense
      fallback={
        <Mask visible={true}>
          <DotLoading color="white" />
        </Mask>
      }
    >
      <Routes>
        {routes.map((item) => {
          let { name, path } = item
          return <Route key={name} path={path} element={<Element {...item} />} />
        })}
      </Routes>
    </Suspense>
  )
}
