import { Button } from '$shared/ui/components/button'
import { m } from '$m'

export function FilesDeletionConfirmation({ onConfirm }: { onConfirm?: () => void }) {
  return (
    <section className="flex flex-col justify-center items-center gap-4 h-96">
      <h1>{m['delete_confirmation.title']()}</h1>
      <p>{m['delete_confirmation.label']()}</p>
      <Button onClick={onConfirm}>{m['delete_confirmation.confirm_button']()}</Button>
    </section>
  )
}
