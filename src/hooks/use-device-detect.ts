import { useMemo } from 'react'
import {
  isMobile as detectIsMobile,
  isTablet as detectIsTablet,
  isDesktop as detectIsDesktop,
  isIOS as detectIsIOS,
  isAndroid as detectIsAndroid,
  isMobileSafari,
  isChrome,
  isFirefox,
  isSafari,
  osName,
  browserName,
} from 'react-device-detect'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface DeviceInfo {
  // 设备类型
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: DeviceType

  // 操作系统
  isIOS: boolean
  isAndroid: boolean
  osName: string

  // 浏览器
  isMobileSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isSafari: boolean
  browserName: string

  // 组合判断
  isMobileDevice: boolean // 移动设备（手机或平板）
  isTouchDevice: boolean // 支持触摸
}

/**
 * 设备检测 Hook
 * 封装 react-device-detect 库，提供完整的设备信息
 * 
 * @returns DeviceInfo 设备信息对象
 * 
 * @example
 * ```tsx
 * const { isMobile, isIOS, isAndroid } = useDeviceDetect()
 * 
 * if (isMobile && isIOS) {
 *   // iOS 移动端特殊处理
 * }
 * ```
 */
export function useDeviceDetect(): DeviceInfo {
  const deviceInfo = useMemo(() => {
    // 检测是否支持触摸
    const isTouchDevice = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0

    // 确定设备类型
    let deviceType: DeviceType = 'desktop'
    if (detectIsMobile) {
      deviceType = 'mobile'
    } else if (detectIsTablet) {
      deviceType = 'tablet'
    }

    return {
      // 设备类型
      isMobile: detectIsMobile,
      isTablet: detectIsTablet,
      isDesktop: detectIsDesktop,
      deviceType,

      // 操作系统
      isIOS: detectIsIOS,
      isAndroid: detectIsAndroid,
      osName: osName || 'unknown',

      // 浏览器
      isMobileSafari,
      isChrome,
      isFirefox,
      isSafari,
      browserName: browserName || 'unknown',

      // 组合判断
      isMobileDevice: detectIsMobile || detectIsTablet,
      isTouchDevice,
    }
  }, [])

  return deviceInfo
}

