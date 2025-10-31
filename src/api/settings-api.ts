/**
 * 系统设置 API
 * 提供系统设置的获取和更新功能
 */

import { get, put } from './api';

/**
 * 设置值类型
 */
export type SettingValueType = 'integer' | 'boolean' | 'decimal' | 'string';

/**
 * 系统设置项
 */
export interface SystemSetting {
  id: number;
  category: string;
  setting_key: string;
  setting_value: string;
  value_type: SettingValueType;
  description: string;
  is_editable: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * 更新设置的请求参数
 */
export interface UpdateSettingRequest {
  id: number;
  setting_value: string;
}

/**
 * 获取所有系统设置
 */
export async function getSystemSettings(): Promise<SystemSetting[]> {
  return get<SystemSetting[]>('/webhook/api/v1/setting');
}

/**
 * 更新系统设置
 */
export async function updateSystemSetting(
  id: number,
  settingValue: string
): Promise<SystemSetting> {
  return put<SystemSetting>('/webhook/api/v1/setting', {
    id,
    setting_value: settingValue,
  });
}

