import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/data/')({
  validateSearch: (search) => ({
    q: search.q as string | undefined,
  }),
})
