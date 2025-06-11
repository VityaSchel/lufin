import { Button } from '$shared/ui/components/button'
import { m } from '$m'

export function FilesDeletionConfirmation({ onConfirm }: { onConfirm?: () => void }) {
  return (
    <section className="flex flex-col justify-center items-center gap-4 h-96">
      <h1>{m.deleteConfirmation_title()}</h1>
      <p>{m.deleteConfirmation_label()}</p>
      <Button onClick={onConfirm}>{m.deleteConfirmation_confirmButton()}</Button>
    </section>
  )
}
