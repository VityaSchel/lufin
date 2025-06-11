import React from 'react'
import { FilesPageTabs } from '$widgets/files-page-tabs'
import { MyFilesTab } from '$widgets/my-files-tab'
import { UploadFilesTab } from '$widgets/upload-files-tab'
import { m } from '$m'

export default function FilesPage() {
  const [tab, setTab] = React.useState<'my_files' | 'upload'>('upload')

  const uploadStrategy: 'sequential' | 'parallel' = 'parallel'

  return (
    <FilesPageTabs
      value={tab}
      onChange={(newTab: string) => setTab(newTab as typeof tab)}
      tabs={[
        {
          key: 'upload',
          title: m.nav_uploadTab(),
          content: (
            <UploadFilesTab
              uploadStrategy={uploadStrategy}
              onGoToMyFiles={() => setTab('my_files')}
            />
          )
        },
        { key: 'my_files', title: m.nav_myFiles(), content: <MyFilesTab /> }
      ]}
    />
  )
}
