import { Fade } from '@mui/material'
import FilesIcon from './icons/files.svg'
import ArchiveIcon from '$assets/archive.svg'
import { useFormikContext } from 'formik'
import type { FilesUploaderFormValues } from '$shared/model/upload-file'
import { nmZipFilename } from '$shared/utils/zip-file-name'
import { HorizontalCard } from '$shared/ui/components/horizontal-card'
import byteSize from 'byte-size'
import plural from 'plural-ru'
import { m } from '$m'
import { RenamableTitle } from '$entities/uploadable-file/renamable-title'

export function UploadableGroupTitle({ disabled }: { disabled: boolean }) {
  const { values, setFieldValue } = useFormikContext<FilesUploaderFormValues>()
  const isZip = values.convertToZip

  const filesCount = values.files?.length ?? 0

  return (
    <>
      <Fade appear={false} in={!isZip} unmountOnExit>
        <div style={{ position: 'absolute' }}>
          <HorizontalCard
            icon={<FilesIcon />}
            title={m.uploadForm_directoryUpload()}
            subtitle={`${filesCount} ${plural(filesCount, m.filesGenitive_one(), m.filesGenitive_few(), m.filesGenitive_many())}`}
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
                : m.uploadForm_archiveEmpty()
            }
          />
        </div>
      </Fade>
    </>
  )
}
