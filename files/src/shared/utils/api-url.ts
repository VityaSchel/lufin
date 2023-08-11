function getBaseFilesAPIUrl() {
  const host = process.env.NEXT_PUBLIC_FILES_API_HOSTPORT as string
  const isSecuredEnv = host.startsWith('localhost')
  return { isSecuredEnv, host }
}

export function getFilesAPIUrl() {
  const { isSecuredEnv, host } = getBaseFilesAPIUrl()
  return `${isSecuredEnv ? 'http' : 'https'}://${host}`
}

export function getFilesAPIWSUrl() {
  const { isSecuredEnv, host } = getBaseFilesAPIUrl()
  return `${isSecuredEnv ? 'ws' : 'wss'}://${host}`
}