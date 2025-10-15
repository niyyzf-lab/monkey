import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  // 默认重定向到 feel 页面
  return <Navigate to="/feel" />
}
