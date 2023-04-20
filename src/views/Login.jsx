import React, { useState, useEffect } from 'react'
import { Form, Input, Toast } from 'antd-mobile'
import { connect } from 'react-redux'
import action from '../store/action'
import './Login.less'
import api from '../api'
import _ from '../assets/utils'
import ButtonModel from '../components/ButtonModel'
import NavBarModel from '../components/NavBarModel'

/* 自定义表单校验规则 */
const validate = {
  phone(_, value) {
    value = value.trim()
    let reg = /^(?:(?:\+|00)86)?1\d{10}$/
    if (value.length === 0) return Promise.reject(new Error('手机号是必填项!'))
    if (!reg.test(value)) return Promise.reject(new Error('手机号格式有误!'))
    return Promise.resolve()
  },
  code(_, value) {
    value = value.trim()
    let reg = /^\d{6}$/
    if (value.length === 0) return Promise.reject(new Error('验证码是必填项!'))
    if (!reg.test(value)) return Promise.reject(new Error('验证码格式有误!'))
    return Promise.resolve()
  },
}

const Login = function Login(props) {
  let { queryUserInfoAsync, navigate, usp } = props

  /* 状态 */
  const [formIns] = Form.useForm(),
    [disabled, setDisabled] = useState(false),
    [countdown, setCountdown] = useState(0)
  /* 表单提交 */
  const submit = async () => {
    try {
      await formIns.validateFields()
      let { phone, code } = formIns.getFieldsValue()
      let { code: codeHttp, token } = await api.login(phone, code)
      if (+codeHttp !== 0) {
        Toast.show({
          icon: 'fail',
          content: '登陆失败',
        })
        formIns.resetFields(['code'])
        return
      }
      _.storage.set('tk', token)
      await queryUserInfoAsync()
      Toast.show({
        icon: 'success',
        content: '登陆/注册成功',
      })
      let to = usp.get('to')
      to ? navigate(to, { replace: true }) : navigate(-1)
    } catch (_) {}
  }

  /* 发送验证码 */
  // let timer = null,
  //   num = 31
  // const countdown = () => {
  //   num--
  //   if (num === 0) {
  //     clearInterval(timer)
  //     timer = null
  //     setSendText(`发送验证码`)
  //     setDisabled(false)
  //     return
  //   }
  //   setSendText(`${num}秒后重发`)
  // }
  const send = async () => {
    try {
      await formIns.validateFields(['phone'])
      let phone = formIns.getFieldValue('phone')
      let { code } = await api.sendPhoneCode(phone)
      if (+code !== 0) {
        Toast.show({
          icon: 'fail',
          content: '发送失败',
        })
        return
      }
      // 发送成功
      setDisabled(true)
      setCountdown(5)
    } catch (_) {}
  }
  // 验证码发送倒计时
  useEffect(() => {
    if (countdown === 0) {
      setDisabled(false)
      return
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown])
  return (
    <div className="loginBox">
      <NavBarModel title="登陆/注册" />
      <Form
        layout="horizontal"
        style={{ '--border-top': 'none' }}
        footer={
          <ButtonModel color="primary" onClick={submit}>
            提交
          </ButtonModel>
        }
        form={formIns}
        initialValues={{ phone: '', code: '' }}
      >
        <Form.Item name="phone" label="手机号" rules={[{ validator: validate.phone }]}>
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item
          name="code"
          label="验证码"
          rules={[{ validator: validate.code }]}
          extra={
            <ButtonModel size="small" color="primary" disabled={disabled || countdown !== 0} onClick={send}>
              {countdown === 0 ? `发送验证码` : `${countdown}s后重发`}
            </ButtonModel>
          }
        >
          <Input />
        </Form.Item>
      </Form>
    </div>
  )
}

export default connect(null, action.base)(Login)
