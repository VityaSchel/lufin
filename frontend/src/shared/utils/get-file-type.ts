export function getFileType(fileType: string, fileName: string): 'love' | 'image' | 'audio' | 'video' | 'spreadsheet' | 'apk' | 'archive' | 'font' | 'text' | 'xml-or-html' | 'virtual-image' | 'jar' | 'pdf' | 'software' | 'torrent' | 'email' | undefined {
  if(fileName === 'devio') { return 'love' }
  if (fileType.startsWith('image/')) {
    return 'image'
  }
  if (fileType.startsWith('audio/')) {
    return 'audio'
  }
  if (fileType.startsWith('video/')) {
    return 'video'
  }
  if ([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.oasis.opendocument.spreadsheet'
  ].includes(fileType)) {
    return 'spreadsheet'
  }
  if (fileType === 'application/vnd.android.package-archive') {
    return 'apk'
  }
  if([
    'application/vnd.rar', 'application/x-rar-compressed',
    'application/zip', 'application/x-zip-compressed', 'multipart/x-zip',
    'application/x-tar', 'application/x-gzip', 'application/x-gtar',
    'application/x-tgz', 'application/tar', 'application/tar+gzip',
    'application/gzip', 'application/x-7z-compressed', 'application/x-bzip2',
    'application/x-dar'
  ].includes(fileType)) {
    return 'archive'
  }
  if (fileType.startsWith('font/') || [
    'application/x-font-truetype', 'application/x-font-ttf',
    'application/x-font-opentype',
    'application/vnd.ms-fontobject', 
    'application/font-woff', 'application/font-woff2',
    'application/font-sfnt',
  ].includes(fileType)) {
    return 'font'
  }
  if (fileType === 'text/plain') {
    return 'text'
  }
  if ([
    'application/xml', 'text/xml',
    'application/atom+xml', 'application/xhtml+xml',
    'text/html'
  ].includes(fileType)) {
    return 'xml-or-html'
  }
  if ([
    'application/x-iso9660-image',
    'application/x-apple-diskimage',
    'application/x-ms-wim'
  ].includes(fileType)) {
    return 'virtual-image'
  }
  if([
    'application/java-archive',
    'application/x-java-archive',
    'application/x-jar'
  ].includes(fileType)) {
    return 'jar'
  }
  if([
    'application/pdf',
    'application/x-pdf'
  ].includes(fileType)) {
    return 'pdf'
  }
  if ([
    'application/x-msdownload',
    'application/x-ms-installer'
  ].includes(fileType)) {
    return 'software'
  }
  if (fileType === 'application/x-bittorrent' || fileName.endsWith('.torrent')) {
    return 'torrent'
  }

  if(
    fileName.endsWith('.email') || 
    fileName.endsWith('.eml') || 
    fileName.endsWith('.emlx')
  ) {
    return 'email'
  }
  if(
    fileName.endsWith('.dmg') ||
    fileName.endsWith('.iso')
  ) {
    return 'virtual-image'
  }

  if(
    fileName.endsWith('.cfg') ||
    fileName.endsWith('.bak') ||
    fileName.endsWith('.dll') ||
    fileName.endsWith('.ini') ||
    fileName.endsWith('.sys') ||
    fileName.endsWith('.lnk') ||
    fileName.endsWith('.log') ||
    fileName.endsWith('.c') ||
    fileName.endsWith('.cs') ||
    fileName.endsWith('.css') ||
    fileName.endsWith('.cpp') ||
    fileName.endsWith('.java') ||
    fileName.endsWith('.php') ||
    fileName.endsWith('.py') ||
    fileName.endsWith('.sh') ||
    fileName.endsWith('.swift') ||
    fileName.endsWith('.sh') ||
    fileName.endsWith('.vb') ||
    fileName.endsWith('.py3') ||
    fileName.endsWith('.exe')
  ) {
    return 'software'
  }

  if(
    fileName.endsWith('.html') ||
    fileName.endsWith('.xml')
  ) {
    return 'xml-or-html'
  }

  if(fileName.endsWith('.apk')) {
    return 'apk'
  }
}