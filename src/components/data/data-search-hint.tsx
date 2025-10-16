import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { memo } from 'react'

interface SearchTerms {
  text: string[]
  tags: string[]
  letters: string[]
}

interface DataSearchHintProps {
  searchQuery: string
  searchTerms: SearchTerms
  totalItems: number
}

export const DataSearchHint = memo(function DataSearchHint({
  searchQuery,
  searchTerms,
  totalItems,
}: DataSearchHintProps) {
  if (!searchQuery) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="border-b border-border/10 bg-secondary/30 backdrop-blur-sm"
      >
        <div className="px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground/70">当前搜索:</span>
            
            {/* 显示解析后的搜索条件 */}
            <div className="flex items-center gap-2 flex-wrap">
              {searchTerms.text.length > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400 text-xs rounded-md border border-blue-500/20">
                  <Search className="w-3 h-3" />
                  <span>关键词: "{searchTerms.text.join(' ')}"</span>
                </div>
              )}
              
              {searchTerms.tags.map(tag => (
                <div key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/15 dark:bg-purple-500/25 text-purple-600 dark:text-purple-400 text-xs rounded-md border border-purple-500/20">
                  <span>@{tag}</span>
                </div>
              ))}
              
              {searchTerms.letters.map(pinyin => (
                <div key={pinyin} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/15 dark:bg-green-500/25 text-green-600 dark:text-green-400 text-xs rounded-md border border-green-500/20">
                  <span>#{pinyin}</span>
                </div>
              ))}
            </div>
            
            <span className="text-muted-foreground/50 text-xs ml-auto">
              找到 {totalItems} 条结果
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

