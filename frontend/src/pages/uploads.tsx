import { LocalStorageActions } from '$features/localstorage-actions'
import { FilesList } from '$features/files-list'
import { m } from '$m'

export function UploadsPage() {
  return (
    <div className="[&_table]:w-full [&_td]:text-center [&_td_button]:m-auto flex flex-col gap-[26px]">
      <div className="">
        <p className="text-[#98A3B0] leading-[120%] text-sm md:text-[18px] mb-5">
          {m.filesList_hint()}
        </p>
        <LocalStorageActions />
      </div>
      <FilesList />
    </div>
  )
}
