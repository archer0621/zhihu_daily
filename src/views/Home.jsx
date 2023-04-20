import React, { useState, useEffect, useRef } from 'react'
import HomeHead from '../components/HomeHead'
import _ from '../assets/utils'
import './Home.less'
import { Swiper, Image, Divider, DotLoading } from 'antd-mobile'
import { Link } from 'react-router-dom'
import api from '../api'
import SkeletonModel from '../components/SkeletonModel'
import NewsItem from '../components/NewsItem'

const Home = function Home() {
  let [today, setToday] = useState(_.formatTime(null, '{0}{1}{2}')),
    [bannerData, setBannerData] = useState([]),
    [newsList, setNewsList] = useState([])
  let loadMore = useRef()
  useEffect(() => {
    (async () => {
      try {
        let { date, stories, top_stories } = await api.queryNewsLatest()
        setToday(date)
        setBannerData(top_stories)
        newsList.push({
          date,
          stories,
        })
        setNewsList([...newsList])
      } catch (_) {}
    })()
  }, [])
  useEffect(() => {
    let observe = new IntersectionObserver(async (changes) => {
      let { isIntersecting } = changes[0]
      if (isIntersecting) {
        try {
          let time = newsList[newsList.length - 1]['date']
          let res = await api.queryNewsBefore(time)
          newsList.push(res)
          setNewsList([...newsList])
        } catch (_) {}
      }
    })
    let loadMoreBox = loadMore.current
    observe.observe(loadMoreBox)
    return () => {
      observe.unobserve(loadMoreBox)
      observe = null
    }
  }, [])
  return (
    <div className="homeBox">
      {/* 首页头部 */}
      <HomeHead today={today} />
      {/* 轮播图 */}
      <div className="swiper-box">
        {bannerData.length > 0 ? (
          <Swiper autoplay={true} loop={true}>
            {bannerData.map((item) => {
              let { id, image, title, hint } = item
              return (
                <Swiper.Item key={id}>
                  <Link to={{ pathname: `/detail/${id}` }}>
                    <Image src={image} lazy />
                    <div className="desc">
                      <h3 className="title">{title}</h3>
                      <p className="author">{hint}</p>
                    </div>
                  </Link>
                </Swiper.Item>
              )
            })}
          </Swiper>
        ) : null}
      </div>
      {/* 首页文章列表 */}
      {newsList.length === 0 ? (
        <SkeletonModel />
      ) : (
        <>
          {newsList.map((item, index) => {
            let { date, stories } = item
            return (
              <div className="news-box" key={date}>
                {index !== 0 ? <Divider contentPosition="left">{_.formatTime(date, '{1}月{2}日')}</Divider> : null}
                <div className="list">
                  {stories.map((cur) => {
                    return <NewsItem key={cur.id} info={cur} />
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}
      {/* 加载更多 */}
      <div
        className="loadmore-box"
        ref={loadMore}
        style={{
          display: newsList.length === 0 ? 'none' : 'block',
        }}
      >
        <DotLoading />
        数据加载中
      </div>
    </div>
  )
}
export default Home
