import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { closeToast, showNotify } from 'vant'
import dayjs from 'dayjs'
import { clearLoading, onLoading } from '@/utils/requestLoading'
import { getExpiredTime, getToken } from '@/utils/auth'
import { refreshToken } from '@/api/common'

/** 不需要携带token的接口,通常是登录相关接口 */
const NotNeedTokenList: string[] = [
  '/pmAuth/thirdLogin',
  '/api/auth/token/refresh',
]

const NotCancelRequestArray: string[] = [
  '/pm/shopping/addShoppingCert',
]

const ignoredErrorList: string[] = [
]

// Create Axios Instance
const request = axios.create({
  withCredentials: false,
  // timeout: 5000,
  baseURL: '/api/pkbmedicine',
})

// 取消重复请求
const pending: any[] = []
const CancelToken = axios.CancelToken

// 移除重复请求
const removePending = (config: any) => {
  for (const key in pending) {
    const item = +key // 转number类型
    const list = pending[key]
    // 当前请求在数组中存在时执行函数体
    /**
     * 过滤需要重复调用的接口
     */
    const filterList: any[] = []
    if (
      !filterList.includes(config.url)
      && list.url === config.url
      && list.method === config.method
      && JSON.stringify(list.params) === JSON.stringify(config.params)
      && JSON.stringify(list.data) === JSON.stringify(config.data)
    ) {
      // 执行取消操作
      list.cancel('取消重复请求')
      // 从数组中移除记录
      pending.splice(item, 1)
    }
  }
}

// request interceptor
request.interceptors.request.use(
  async (config: any) => {
    if (!NotCancelRequestArray.includes(config.url)) {
      removePending(config)
      config.cancelToken = new CancelToken((c) => {
        pending.push({
          url: config.url,
          method: config.method,
          params: config.params,
          data: config.data,
          cancel: c,
        })
      })
    }
    console.log(config.url, 'haha')
    // 判断Token是否过期, 用refToken去换新的token
    const expiredTime = getExpiredTime()
    // 后端接口过期时间有可能是字符串，也有可能是时间格式，所以要判断一下
    const isExpiration = (expiredTime && dayjs().isAfter(dayjs(expiredTime > 0 ? Number(expiredTime) : expiredTime).subtract(1, 'minute'))) && !NotNeedTokenList.includes(config.url)
    console.log(isExpiration, 'isExpiration')

    if (isExpiration) await refreshToken()

    // do something before request is sent
    const token = getToken()

    if (token && !NotNeedTokenList.includes(config.url as string)) {
      // let each request carry token
      config.headers = {
        ...config.headers,
        Authorization: token,
      }
    }

    /* 全局加载动画,可在根目录下setting.ts中配置不需要加载动画的接口 */
    onLoading(config.url as string)

    return config
  },
  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  },
)

// response interceptor
request.interceptors.response.use(
  (response) => {
    removePending(response.config)
    /* 全局加载动画 */
    clearLoading(response.config.url as string)
    /* Unauthorized */
    if (response.status === 401) {
      showNotify({ type: 'danger', message: '无权限' })
      return Promise.reject(response.data.message)
    }
    /* Success */
    else if (response.status === 200) {
      if (response.data.code == 9999) {
        if (!ignoredErrorList.includes(response.config.url as string)) {
          showNotify({ type: 'danger', message: response.data.message })
          return Promise.reject(response.data.message)
        }
        return response
      }
      if (response.data.code === 1001) {
        showNotify({ type: 'danger', message: '登录状态已过期,请重新登录' })
        return Promise.reject(response.data.message)
      }
      else { return response }
    }
  },
  (error) => {
    console.log(error)
    /* 全局加载动画 */
    clearLoading(error?.config?.url as string || '')
    closeToast()
    //
    if (error.code === 'ERR_CANCELED') return Promise.reject(error.message)
    //
    if (error.message.includes('429'))
      showNotify({ type: 'danger', message: '服务器繁忙,请稍后再试!' })
    else if (!ignoredErrorList.includes(error?.config?.url))
      showNotify({ type: 'danger', message: error.message })
    return Promise.reject(error.message)
  },
)

export default <T = any>(config: AxiosRequestConfig) => {
  return request(config).then((res) => {
    return (res?.data) as T
  })
}
