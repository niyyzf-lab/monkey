import { pinyin } from 'pinyin-pro'

// 多音字映射表 - 针对金融领域常见词汇
const polytonicCharMap: Record<string, string> = {
  '行': 'H', // 银行、证券行
  '中': 'Z', // 中国、中信
  '发': 'F', // 招商发展
  '长': 'C', // 长江、长城
  '重': 'C', // 重庆
}

// 使用 pinyin-pro 库获取中文拼音首字母
const getPinyinFirstLetter = (char: string): string => {
  try {
    const firstLetter = pinyin(char, { 
      pattern: 'first',
      toneType: 'none'
    }).toUpperCase()
    
    return firstLetter || char
  } catch {
    return char
  }
}

// 获取字符串的简拼（所有汉字的拼音首字母组合）
export const getSimplePinyin = (text: string): string => {
  try {
    const chineseChars = text.replace(/[^\u4e00-\u9fa5]/g, '')
    
    const simplePinyin = chineseChars
      .split('')
      .map(char => polytonicCharMap[char] || getPinyinFirstLetter(char))
      .join('')
      .toUpperCase()
    
    return simplePinyin
  } catch {
    return ''
  }
}

