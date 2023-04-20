import React from 'react'
import { Skeleton } from 'antd-mobile'
import './SkeletonModel.less'

const SkeletonModel = function SkeletonModel() {
  return (
    <div className="skeleton-box">
      <Skeleton.Title animated />
      <Skeleton.Paragraph lineCount={5} animated />
    </div>
  )
}

export default SkeletonModel
