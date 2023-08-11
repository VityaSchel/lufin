import MimeApk from '@/assets/file-icons/mime-apk.svg'
import MimeArchive from '@/assets/file-icons/mime-archive.svg'
import MimeAudio from '@/assets/file-icons/mime-audio.svg'
import MimeEmail from '@/assets/file-icons/mime-email.svg'
import MimeFont from '@/assets/file-icons/mime-font.svg'
import MimeImage from '@/assets/file-icons/mime-image.svg'
import MimeIso from '@/assets/file-icons/mime-iso.svg'
import MimeJar from '@/assets/file-icons/mime-jar.svg'
import MimePDF from '@/assets/file-icons/mime-pdf.svg'
import MimeSoftware from '@/assets/file-icons/mime-software.svg'
import MimeSpreadsheet from '@/assets/file-icons/mime-spreadsheet.svg'
import MimeText from '@/assets/file-icons/mime-text.svg'
import MimeTorrent from '@/assets/file-icons/mime-torrent.svg'
import MimeVideo from '@/assets/file-icons/mime-video.svg'
import MimeXMLorHTML from '@/assets/file-icons/mime-xml-html.svg'
import MimeHeart from '@/assets/file-icons/mime-heart.svg'
import FileIcon from '@/assets/file-icons/file.svg'

export function getSvgIconByFileType(fileType: string | undefined) {
  switch (fileType) {
    case 'image':
      return <MimeImage />
    case 'audio':
      return <MimeAudio />
    case 'video':
      return <MimeVideo />
    case 'spreadsheet':
      return <MimeSpreadsheet />
    case 'apk':
      return <MimeApk />
    case 'archive':
      return <MimeArchive />
    case 'font':
      return <MimeFont />
    case 'text':
      return <MimeText />
    case 'xml-or-html':
      return <MimeXMLorHTML />
    case 'virtual-image':
      return <MimeIso />
    case 'jar':
      return <MimeJar />
    case 'pdf':
      return <MimePDF />
    case 'software':
      return <MimeSoftware />
    case 'torrent':
      return <MimeTorrent />
    case 'email':
      return <MimeEmail />
    case 'love':
      return <MimeHeart />
    default:
      return <FileIcon />
  }
}