import { m } from '$m'

export default function PageNotFound() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-230px)]">
      <h1>{m['page_not_found']()}</h1>
    </div>
  )
}
