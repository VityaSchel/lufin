import React from 'react'
import { FilesUploaderFormValues } from '@/shared/model/files-uploader-values'
import { Button } from '@/shared/ui/components/button'
import { useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'

export function SubmitFilesButton() {
  const { t } = useTranslation('filesharing')
  const { values, errors, isSubmitting } = useFormikContext<FilesUploaderFormValues>()

  const sumSizeBytes = React.useMemo(() =>
    values.files
      ? values.files.reduce((prev, cur) => prev + cur.blob.size, 0)
      : 0,
  [values.files])

  const sumSizeExceededLimit = sumSizeBytes > 1000 * 1000 * 100

  return (
    <Button
      type="submit"
      disabled={!values.files?.length || sumSizeExceededLimit || isSubmitting || Object.values(errors).length > 0}
      className='w-full !rounded-[10px]'
    >
      <span className='flex items-center gap-2'>
        {t('upload_form.finish_upload_button')} {values.encrypt ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm6-5q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6z"></path></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17m-6 5q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h7V6q0-2.075 1.463-3.537T18 1q1.875 0 3.263 1.213T22.925 5.2q.05.325-.225.563T22 6t-.7-.175t-.4-.575q-.275-.95-1.062-1.6T18 3q-1.25 0-2.125.875T15 6v2h3q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22z"></path></svg>
        )}
      </span>
    </Button>
  )
}