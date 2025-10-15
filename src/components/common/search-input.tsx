import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  className?: string
}

export function SearchInput({ 
  value, 
  onChange, 
  onClear, 
  placeholder = "搜索...",
  className 
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 bg-background/50 border-border/50 
                 focus:bg-background focus:border-border transition-all duration-200"
      />
      {value && (
        <Button
          onClick={onClear}
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 
                   hover:bg-muted/50 transition-colors duration-200"
          aria-label="清除搜索"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}



