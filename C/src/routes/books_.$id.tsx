import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/books_/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/books/$id"!</div>
}
