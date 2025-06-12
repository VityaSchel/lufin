import { m } from '$m'

export default function PageNotFound() {
  return (
    <div className="flex items-center justify-center flex-1">
      <h1>{m.pageNotFound()}</h1>
    </div>
  )
}
