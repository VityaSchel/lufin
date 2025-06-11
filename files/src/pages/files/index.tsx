import React from 'react'
import { FilesPageTabs } from '$widgets/files-page-tabs'
import { MyFilesTab } from '$widgets/my-files-tab'
import { UploadFilesTab } from '$widgets/upload-files-tab'

export default function FilesPage() {
  const { t } = useTranslation('filesharing')
  const [tab, setTab] = React.useState<'my_files' | 'upload'>('upload')

  const uploadStrategy: 'sequential' | 'parallel' = 'parallel'

  return (
    <FilesPageTabs
      value={tab}
      onChange={(newTab: string) => setTab(newTab as typeof tab)}
      tabs={[
        {
          key: 'upload',
          title: t('nav.upload_tab'),
          content: (
            <UploadFilesTab
              uploadStrategy={uploadStrategy}
              onGoToMyFiles={() => setTab('my_files')}
            />
          )
        },
        { key: 'my_files', title: t('nav.my_files'), content: <MyFilesTab /> }
      ]}
    />
  )
}
