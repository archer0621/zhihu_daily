import React, { useState, useEffect } from 'react'
import './Details.less'
import { LeftOutline, MessageOutline, LikeOutline, StarOutline, MoreOutline } from 'antd-mobile-icons'
import { Badge, Toast } from 'antd-mobile'
import SkeletonModel from '../components/SkeletonModel'
import api from '../api'
import { flushSync } from 'react-dom'
import { useMemo } from 'react'
import { connect } from 'react-redux';
import action from '../store/action';
const Details = function Details(props) {
  let { navigate, params } = props
  let [info, setInfo] = useState(null)
  let [extra, setExtra] = useState(null)
  let link
  const handleStyle = (res) => {
    let { css } = res
    if (!Array.isArray(css)) return
    css = css[0]
    if (!css) return
    link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = css
    document.head.appendChild(link)
  }
  const handleImage = (result) => {
    let imgPlaceHolder = document.querySelector('.img-place-holder')
    if (!imgPlaceHolder) return
    // 创建大图
    let tempImg = new Image()
    tempImg.src = result.image
    tempImg.onload = () => {
      imgPlaceHolder.appendChild(tempImg)
    }
    tempImg.onerror = () => {
      let parent = imgPlaceHolder.parentNode
      parent.parentNode.removeChild(parent)
    }
  }
  useEffect(() => {
    ;(async () => {
      try {
        let result = await api.queryNewsInfo(params.id)
        flushSync(() => {
          setInfo(result)
          handleStyle(result)
        })
        handleImage(result)
      } catch (_) {}
    })()
    // 销毁组件:移除创建的样式
    return () => {
      if (link) document.head.removeChild(link)
    }
  }, [])
  // 收藏
  let {
    base: { info: userInfo },
    queryUserInfoAsync,
    location,
    store: { list: storeList },
    queryStoreListAsync,
    removeStoreListById,
  } = props
  useEffect(() => {
    ;(async () => {
      if (!userInfo) {
        let { info } = await queryUserInfoAsync()
        userInfo = info
      }
      if (userInfo && !storeList) {
        queryStoreListAsync()
      }
    })()
  }, [])
  // 依赖于收藏列表和路径参数,计算出是否收藏
  const isStore = useMemo(() => {
    if (!storeList) {
      return false
    }
    return storeList.some((item) => {
      return +item.news.id === +params.id
    })
  }, [storeList, params])
  // 点击收藏
  const handleStore = async () => {
    // 未登录
    if (!userInfo) {
      Toast.show({
        icon: 'fail',
        content: '请先登录',
      })
      navigate(`/login?to=${location.pathname}`, { repalce: true })
      return
    }
    // 已登录，取消收藏
    if (isStore) {
      let item = storeList.find((item) => {
        return +item.news.id === +params.id
      })
      if (!item) return
      let { code } = await api.storeRemove(item.id)
      if (+code !== 0) {
        Toast.show({
          icon: 'fail',
          content: '操作失败',
        })
        return
      }
      Toast.show({
        icon: 'success',
        content: '取消收藏成功',
      })
      removeStoreListById(item.id)
      return
    }
    // 已登录，收藏
    try {
      let { code } = await api.store(params.id)
      if (+code !== 0) {
        Toast.show({
          icon: 'fail',
          content: '收藏失败',
        })
        return
      }
      Toast.show({
        icon: 'success',
        content: '收藏成功',
      })
      queryStoreListAsync() //同步最新的收藏列表到redux容器中
    } catch (_) {}
  }
  return (
    <div className="detailsBox">
      {!info ? (
        <SkeletonModel />
      ) : (
        <div
          className="content"
          dangerouslySetInnerHTML={{
            __html: info.body,
          }}
        ></div>
      )}
      {/* 底部栏 */}
      <div className="tab-bar">
        <div
          className="back"
          onClick={() => {
            navigate(-1)
          }}
        >
          <LeftOutline />
        </div>
        <div className="icons">
          <Badge content={extra ? extra.comments : 0}>
            <MessageOutline />
          </Badge>
          <Badge content={extra ? extra.popularity : 0}>
            <LikeOutline />
          </Badge>
          <span className={isStore ? 'stored' : ''} onClick={handleStore}>
            <StarOutline />
          </span>
          <span>
            <MoreOutline />
          </span>
        </div>
      </div>
    </div>
  )
}

export default connect(
  (state) => {
    return {
      base: state.base,
      store: state.store,
    }
  },
  { ...action.base, ...action.store }
)(Details)
