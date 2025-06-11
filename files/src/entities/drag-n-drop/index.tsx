import React from 'react'
import styles from './styles.module.scss'
import DragNDropIcon from './drag-n-drop-zone-icon.svg'
import { Button } from '$shared/ui/components/button'
import UploadIcon from './upload-icon.svg'
import { type DropTargetMonitor, useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { type FilesUploaderFormValues } from '$shared/model/files-uploader-values'
import { m } from '$m'

export function DragNDrop({
  onChange,
  disabled
}: {
  onChange: (value: File[] | null) => any
  disabled: boolean
}) {
  const { values } = useFormikContext<FilesUploaderFormValues>()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleChange = (files: FileList | null) => {
    if (files && !disabled) {
      onChange(Array.from(files))
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const [{ canDrop, isOver }, fileDropZoneRef] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: FileList }) {
        handleChange(item.files)
      },
      canDrop() {
        return !disabled
      },
      collect: (monitor: DropTargetMonitor) => {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop()
        }
      }
    }),
    [disabled]
  )
  const isActive = canDrop && isOver

  return (
    <>
      <div
        className={cx(styles.dragNDropZone, { [styles.active]: isActive && !disabled })}
        ref={fileDropZoneRef as any}
      >
        <div className={styles.dragNDropContent}>
          <div className={styles.dragNDropIcon}>
            <DragNDropIcon />
          </div>
          <div className={styles.dragNDropLabels}>
            <span>{m['upload_form.drag_n_drop']()}</span>
            <span className={styles.or}>{m['upload_form.or']()}</span>
            <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
              {values.files?.length
                ? m['upload_form.add_files']()
                : m['upload_form.select_files']()}
              <UploadIcon />
            </Button>
          </div>
        </div>
      </div>
      <input
        type="file"
        name="file"
        multiple
        onChange={(e) => handleChange(e.target.files)}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
    </>
  )
}
