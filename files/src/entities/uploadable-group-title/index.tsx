import styles from './styles.module.scss'
import { Fade, useMediaQuery } from '@mui/material'
import FilesIcon from './icons/files.svg'
import ArchiveIcon from '$assets/archive.svg'
import { useFormikContext } from 'formik'
import { FilesUploaderFormValues } from '$shared/model/files-uploader-values'
import { nmZipFilename } from '$shared/utils/zip-file-name'
import { HorizontalCard } from '$shared/ui/components/horizontal-card'
import byteSize from 'byte-size'
import plural from 'plural-ru'
import { m } from '$m'
import { RenamableTitle } from '$entities/uploadable-file/renamable-title'

export function UploadableGroupTitle({ disabled }: { disabled: boolean }) {
  const { values, setFieldValue } = useFormikContext<FilesUploaderFormValues>()
  const isZip = values.convertToZip
  const isMobile = useMediaQuery('(max-width: 768px)')

  const filesCount = values.files?.length ?? 0

  return (
    <>
      <Fade in={!isZip} unmountOnExit>
        <div style={{ position: 'absolute' }}>
          <HorizontalCard
            icon={<FilesIcon />}
            title={m['upload_form.directory_upload']()}
            subtitle={`${filesCount} ${plural(filesCount, m['files_genitive.one'](), m['files_genitive.few'](), m['files_genitive.many']())}`}
          />
        </div>
      </Fade>
      <Fade in={isZip} unmountOnExit>
        <div style={{ position: 'absolute' }}>
          <HorizontalCard
            icon={<ArchiveIcon />}
            title={
              <RenamableTitle
                value={values.zipArchiveName ?? ''}
                onChange={(name) => {
                  setFieldValue('zipArchiveName', nmZipFilename(name))
                }}
                placeholder="documents.zip"
                readonly={disabled}
              />
            }
            subtitle={
              values.files?.length
                ? byteSize(values.files.reduce((prev, cur) => prev + cur.blob.size, 0)).toString()
                : m['upload_form.archive_empty']()
            }
          />
        </div>
      </Fade>
    </>
  )
}
