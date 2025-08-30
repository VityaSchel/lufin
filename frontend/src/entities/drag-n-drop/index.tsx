import React from 'react'
import styles from './styles.module.scss'
import DragNDropIcon from './drag-n-drop-zone-icon.svg'
import { Button } from '$shared/ui/components/button'
import UploadIcon from './upload-icon.svg'
import { type DropTargetMonitor, useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { type FilesUploaderFormValues } from '$shared/model/upload-file'
import { m } from '$m'

export function DragNDrop({
  onAddDroppedItems,
  disabled
}: {
  onAddDroppedItems: (files: File[]) => any
  disabled: boolean
}) {
  const { values } = useFormikContext<FilesUploaderFormValues>()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [{ canDrop, isOver }, fileDropZoneRef] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: FileList }) {
        onAddDroppedItems(Array.from(item.files))
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
        className={cx(styles.dragNDropZone, {
          [styles.active]: isActive && !disabled
        })}
        ref={fileDropZoneRef as any}
      >
        <div className={styles.dragNDropContent}>
          <div className={styles.dragNDropIcon}>
            <DragNDropIcon />
          </div>
          <div className={styles.dragNDropLabels}>
            <span>{m.uploadForm_dragNDrop()}</span>
            <span className={styles.or}>{m.uploadForm_or()}</span>
            <Button onClick={() => fileInputRef.current?.click()} disabled={disabled}>
              {values.files?.length ? m.uploadForm_addFiles() : m.uploadForm_selectFiles()}
              <UploadIcon />
            </Button>
          </div>
        </div>
      </div>
      <input
        type="file"
        name="file"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            onAddDroppedItems(Array.from(e.target.files))
          }
          e.target.value = ''
        }}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
    </>
  )
}
