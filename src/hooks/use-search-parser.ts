import { useCallback, useMemo } from 'react'

export interface SearchTerms {
  text: string[]
  tags: string[]
  letters: string[]
}

export function useSearchParser(query: string): SearchTerms {
  const parseSearchQuery = useCallback((searchQuery: string): SearchTerms => {
    const searchTerms: SearchTerms = {
      text: [],
      tags: [],
      letters: []
    }

    if (!searchQuery.trim()) return searchTerms

    const terms = searchQuery.trim().split(/\s+/)
    
    terms.forEach(term => {
      if (term.startsWith('@')) {
        const tag = term.slice(1)
        if (tag) searchTerms.tags.push(tag)
      } else if (term.startsWith('#')) {
        const pinyinStr = term.slice(1).toUpperCase()
        if (pinyinStr && /^[A-Z]+$/.test(pinyinStr)) searchTerms.letters.push(pinyinStr)
      } else if (term.includes(':')) {
        const [key, value] = term.split(':', 2)
        if (key === 'tag' && value) {
          searchTerms.tags.push(value)
        } else if (key === 'letter' && value) {
          const letter = value.toUpperCase()
          if (letter.length === 1) searchTerms.letters.push(letter)
        } else {
          searchTerms.text.push(term)
        }
      } else {
        searchTerms.text.push(term)
      }
    })

    return searchTerms
  }, [])

  return useMemo(() => parseSearchQuery(query), [query, parseSearchQuery])
}

