/**
 * 标签格式验证工具函数
 */

export type TagValidationStatus = 'valid' | 'warning' | 'error' | 'special'

export interface TagValidationResult {
  status: TagValidationStatus
  message?: string
  isSpecial?: boolean
}

/**
 * 标签完整格式验证结果
 */
export interface TagFormatValidationResult {
  isValid: boolean
  category?: string
  content?: string
  supplement?: string
  errors: string[]
}

// 特殊单字标签白名单 - 这些是有意义的单字标签
const SPECIAL_SINGLE_CHAR_TAGS = new Set([
  // 金属材料
  '铜', '铁', '铝', '锌', '锡', '镍', '银', '金', '钢', '铅',
  // 化工材料
  '油', '气', '煤', '盐', '酸', '碱', '硫', '氯', '氢', '氧',
  // 行业分类
  '医', '药', '食', '酒', '茶', '糖', '米', '面', '奶', '肉',
  // 科技概念
  '芯', '屏', '网', '云', '链', '币', '电', '光', '波', '磁',
  // 地域概念
  '沪', '深', '京', '港', '台', '粤', '苏', '浙', '鲁', '川',
  // 其他重要概念
  '新', '老', '大', '小', '高', '低', '强', '弱', '快', '慢'
])

// 常见的无意义单字标签
const MEANINGLESS_SINGLE_CHAR_TAGS = new Set([
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  '?', '!', '@', '#', '$', '%', '^', '&', '*', '+', '=', '|', '\\', '/', '<', '>'
])

/**
 * 验证标签格式
 * @param tagName 标签名称
 * @param tagDetail 标签详情（可选）
 * @returns 验证状态
 */
export function validateTagFormat(tagName: string, tagDetail?: string): TagValidationStatus {
  // 严重错误：空标签名称
  if (!tagName || tagName.trim().length === 0) {
    return 'error'
  }
  
  const trimmedName = tagName.trim()
  
  // 严重错误：标签名称包含特殊字符或格式错误
  if (trimmedName.includes('::') || trimmedName.includes('{{') || trimmedName.includes('}}')) {
    return 'error'
  }
  
  // 严重错误：标签名称包含非法字符
  if (trimmedName.includes('\n') || trimmedName.includes('\t') || trimmedName.includes('\r')) {
    return 'error'
  }
  
  // 严重错误：标签名称以特殊字符开头或结尾
  if (trimmedName.startsWith(' ') || trimmedName.endsWith(' ') || 
      trimmedName.startsWith('-') || trimmedName.startsWith('_')) {
    return 'error'
  }
  
  // 严重错误：无意义的单字标签
  if (trimmedName.length === 1 && MEANINGLESS_SINGLE_CHAR_TAGS.has(trimmedName.toLowerCase())) {
    return 'error'
  }
  
  // 特殊处理：有意义的单字标签
  if (trimmedName.length === 1 && SPECIAL_SINGLE_CHAR_TAGS.has(trimmedName)) {
    return 'special'
  }
  
  // 警告：标签名称过长
  if (trimmedName.length > 20) {
    return 'warning'
  }
  
  // 警告：详情信息过长
  if (tagDetail && tagDetail.length > 50) {
    return 'warning'
  }
  
  // 警告：标签名称过短（但不在特殊白名单中）
  if (trimmedName.length < 2) {
    return 'warning'
  }
  
  return 'valid'
}

/**
 * 获取验证状态的详细信息
 * @param tagName 标签名称
 * @param tagDetail 标签详情（可选）
 * @returns 验证结果包含状态和消息
 */
export function getTagValidationResult(tagName: string, tagDetail?: string): TagValidationResult {
  const status = validateTagFormat(tagName, tagDetail)
  const trimmedName = tagName?.trim() || ''
  
  let message: string | undefined
  let isSpecial = false
  
  switch (status) {
    case 'error':
      if (!tagName || tagName.trim().length === 0) {
        message = '标签名称不能为空'
      } else if (tagName.includes('::') || tagName.includes('{{') || tagName.includes('}}')) {
        message = '标签名称包含非法字符'
      } else if (tagName.includes('\n') || tagName.includes('\t') || tagName.includes('\r')) {
        message = '标签名称不能包含换行符或制表符'
      } else if (tagName.startsWith(' ') || tagName.endsWith(' ')) {
        message = '标签名称不能以空格开头或结尾'
      } else if (tagName.startsWith('-') || tagName.startsWith('_')) {
        message = '标签名称不能以特殊字符开头'
      } else if (trimmedName.length === 1) {
        message = '无意义的单字标签'
      }
      break
      
    case 'warning':
      if (tagName.length > 20) {
        message = '标签名称过长，建议缩短'
      } else if (tagDetail && tagDetail.length > 50) {
        message = '标签详情过长，建议精简'
      } else if (tagName.length < 2) {
        message = '标签名称过短，可能无意义'
      }
      break
      
    case 'special':
      message = '重要的行业标签'
      isSpecial = true
      break
      
    case 'valid':
      message = '标签格式正确'
      break
  }
  
  return { status, message, isSpecial }
}

/**
 * 获取标签验证状态的样式类名
 * @param status 验证状态
 * @returns 样式类名对象
 */
export function getTagValidationStyles(status: TagValidationStatus) {
  switch (status) {
    case 'error':
      return {
        containerClass: 'bg-destructive/10 border-l-destructive hover:border-l-destructive',
        iconClass: 'text-destructive',
        textClass: 'text-destructive',
        subtextClass: 'text-destructive/70',
        badgeClass: 'border-destructive/50 text-destructive',
        chevronClass: 'text-destructive/70 group-hover:text-destructive'
      }
      
    case 'warning':
      return {
        containerClass: 'bg-yellow-500/10 border-l-yellow-500 hover:border-l-yellow-500',
        iconClass: 'text-yellow-500',
        textClass: 'text-yellow-600',
        subtextClass: 'text-yellow-600/70',
        badgeClass: 'border-yellow-500/50 text-yellow-600',
        chevronClass: 'text-yellow-600/70 group-hover:text-yellow-600'
      }
      
    case 'special':
      return {
        containerClass: 'bg-blue-500/10 border-l-blue-500 hover:border-l-blue-500',
        iconClass: 'text-blue-500',
        textClass: 'text-blue-600 font-medium',
        subtextClass: 'text-blue-600/70',
        badgeClass: 'border-blue-500/50 text-blue-600 bg-blue-500/10',
        chevronClass: 'text-blue-600/70 group-hover:text-blue-600'
      }
      
    case 'valid':
    default:
      return {
        containerClass: '',
        iconClass: 'text-green-500 opacity-60',
        textClass: '',
        subtextClass: '',
        badgeClass: '',
        chevronClass: ''
      }
  }
}

/**
 * 验证标签是否符合 "分类:内容{补充}" 格式
 * 正确格式示例: 
 * - "行业:医疗"
 * - "行业:医疗{医疗器械}"
 * - "概念:新能源{锂电池}"
 * 
 * @param categoryName 分类名称
 * @param tagName 标签名称
 * @param tagDetail 标签补充说明（可选）
 * @returns 格式验证结果
 */
export function validateTagStructureFormat(
  categoryName: string,
  tagName: string,
  tagDetail?: string
): TagFormatValidationResult {
  const errors: string[] = []
  
  // 1. 检查分类名称
  if (!categoryName || categoryName.trim().length === 0) {
    errors.push('缺少分类名称')
  } else if (categoryName.includes(':')) {
    errors.push('分类名称不应包含冒号 ":"')
  } else if (categoryName.includes('{') || categoryName.includes('}')) {
    errors.push('分类名称不应包含大括号 "{" 或 "}"')
  }
  
  // 2. 检查标签内容
  if (!tagName || tagName.trim().length === 0) {
    errors.push('缺少标签内容')
  } else {
    // 检查是否包含非法字符
    if (tagName.includes(':')) {
      errors.push('标签内容不应包含冒号 ":"')
    }
    if (tagName.includes('{') || tagName.includes('}')) {
      errors.push('标签内容不应包含大括号 "{" 或 "}"')
    }
    // 检查是否有前后空格
    if (tagName !== tagName.trim()) {
      errors.push('标签内容前后有多余空格')
    }
  }
  
  // 3. 检查补充说明（如果有）
  if (tagDetail) {
    if (tagDetail.includes(':')) {
      errors.push('补充说明不应包含冒号 ":"')
    }
    if (tagDetail.includes('{') || tagDetail.includes('}')) {
      errors.push('补充说明不应包含大括号 "{" 或 "}"')
    }
    if (tagDetail !== tagDetail.trim()) {
      errors.push('补充说明前后有多余空格')
    }
    if (tagDetail.length > 100) {
      errors.push('补充说明过长（超过100字符）')
    }
  }
  
  return {
    isValid: errors.length === 0,
    category: categoryName?.trim(),
    content: tagName?.trim(),
    supplement: tagDetail?.trim(),
    errors
  }
}

/**
 * 格式化标签为标准格式字符串
 * @param categoryName 分类名称
 * @param tagName 标签名称
 * @param tagDetail 标签补充说明（可选）
 * @returns 格式化后的标签字符串
 */
export function formatTagString(
  categoryName: string,
  tagName: string,
  tagDetail?: string
): string {
  const base = `${categoryName}:${tagName}`
  return tagDetail ? `${base}{${tagDetail}}` : base
}

/**
 * 解析标签字符串为结构化数据
 * @param tagString 标签字符串，如 "行业:医疗{医疗器械}"
 * @returns 解析结果
 */
export function parseTagString(tagString: string): TagFormatValidationResult {
  const errors: string[] = []
  
  if (!tagString || tagString.trim().length === 0) {
    return {
      isValid: false,
      errors: ['标签字符串为空']
    }
  }
  
  const trimmed = tagString.trim()
  
  // 检查是否包含冒号（必须）
  if (!trimmed.includes(':')) {
    return {
      isValid: false,
      errors: ['缺少分类与内容的分隔符 ":"']
    }
  }
  
  // 分离分类和内容部分
  const colonIndex = trimmed.indexOf(':')
  const category = trimmed.substring(0, colonIndex)
  const rest = trimmed.substring(colonIndex + 1)
  
  if (category.length === 0) {
    errors.push('分类名称为空')
  }
  
  // 检查是否有补充说明
  let content = ''
  let supplement: string | undefined
  
  const openBraceIndex = rest.indexOf('{')
  const closeBraceIndex = rest.indexOf('}')
  
  if (openBraceIndex !== -1 || closeBraceIndex !== -1) {
    // 存在大括号，需要验证格式
    if (openBraceIndex === -1) {
      errors.push('缺少左大括号 "{"')
    } else if (closeBraceIndex === -1) {
      errors.push('缺少右大括号 "}"')
    } else if (openBraceIndex > closeBraceIndex) {
      errors.push('大括号顺序错误')
    } else if (closeBraceIndex !== rest.length - 1) {
      errors.push('右大括号 "}" 应该在末尾')
    } else {
      content = rest.substring(0, openBraceIndex)
      supplement = rest.substring(openBraceIndex + 1, closeBraceIndex)
      
      if (content.length === 0) {
        errors.push('标签内容为空')
      }
      if (supplement.length === 0) {
        errors.push('补充说明为空（如果不需要补充说明，请删除大括号）')
      }
    }
  } else {
    content = rest
    if (content.length === 0) {
      errors.push('标签内容为空')
    }
  }
  
  return {
    isValid: errors.length === 0,
    category: category || undefined,
    content: content || undefined,
    supplement: supplement,
    errors
  }
}
