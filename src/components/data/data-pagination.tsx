import { motion } from 'motion/react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '../ui/pagination'
import { memo } from 'react'

interface DataPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const DataPagination = memo(function DataPagination({
  currentPage,
  totalPages,
  onPageChange,
}: DataPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex justify-center py-8"
    >
      <div className="bg-secondary/40 dark:bg-secondary/60 backdrop-blur-md rounded-lg p-3 border border-border/20 dark:border-border/40 shadow-lg">
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <div
                onClick={() => onPageChange(currentPage - 1)}
                className={`inline-flex items-center justify-center gap-1 pl-2.5 h-10 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md border border-border/40 bg-background/80 dark:bg-background/60 shadow-sm ${
                  currentPage <= 1 
                    ? "pointer-events-none opacity-30 cursor-not-allowed" 
                    : "cursor-pointer hover:bg-accent hover:text-accent-foreground hover:border-primary/30"
                }`}
                aria-label="转到上一页"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>上一页</span>
              </div>
            </PaginationItem>
          
            {/* 页码显示逻辑 */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNumber: number;
              
              if (totalPages <= 7) {
                pageNumber = i + 1;
              } else if (currentPage <= 4) {
                if (i < 5) {
                  pageNumber = i + 1;
                } else if (i === 5) {
                  return (
                    <PaginationItem key="ellipsis1">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else {
                  pageNumber = totalPages;
                }
              } else if (currentPage >= totalPages - 3) {
                if (i === 0) {
                  pageNumber = 1;
                } else if (i === 1) {
                  return (
                    <PaginationItem key="ellipsis2">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else {
                  pageNumber = totalPages - 5 + i;
                }
              } else {
                if (i === 0) {
                  pageNumber = 1;
                } else if (i === 1) {
                  return (
                    <PaginationItem key="ellipsis3">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else if (i === 5) {
                  return (
                    <PaginationItem key="ellipsis4">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else if (i === 6) {
                  pageNumber = totalPages;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => onPageChange(pageNumber)}
                    isActive={currentPage === pageNumber}
                    className={`cursor-pointer transition-all duration-200 ease-out rounded-md border ${
                      currentPage === pageNumber 
                        ? "bg-primary text-primary-foreground font-semibold border-primary shadow-sm" 
                        : "bg-background/80 dark:bg-background/60 border-border/40 hover:bg-accent hover:text-accent-foreground hover:border-primary/30"
                    }`}
                    size="icon"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          
            <PaginationItem>
              <div
                onClick={() => onPageChange(currentPage + 1)}
                className={`inline-flex items-center justify-center gap-1 pr-2.5 h-10 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md border border-border/40 bg-background/80 dark:bg-background/60 shadow-sm ${
                  currentPage >= totalPages 
                    ? "pointer-events-none opacity-30 cursor-not-allowed" 
                    : "cursor-pointer hover:bg-accent hover:text-accent-foreground hover:border-primary/30"
                }`}
                aria-label="转到下一页"
              >
                <span>下一页</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </motion.div>
  )
})

