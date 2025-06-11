export const embedLinkNames = [
  'direct_link',
  'markdown_link',
  'markdown_image',
  'forum_thumbnail',
  'website_thumbnail',
  'forum_hotlink',
  'website_hotlink'
] as const

export type EmbedLinkName = (typeof embedLinkNames)[number]

export function getEmbedLinks(
  pageId: string,
  file: string
): { name: EmbedLinkName; text: string }[] {
  const pageURL = `${window.location.origin}/${pageId}/${encodeURIComponent(file)}`
  const directURL = `${import.meta.env.VITE_API_URL}/page/${pageId}/${encodeURIComponent(file)}`

  return [
    { name: 'direct_link', text: directURL },
    { name: 'markdown_link', text: `[Untitled](${directURL})` },
    { name: 'markdown_image', text: `[![Untitled](${directURL})](${pageURL})` },
    { name: 'forum_thumbnail', text: `[url=${pageURL}][img]${directURL}[/img][/url]` },
    {
      name: 'website_thumbnail',
      text: `<a href="${pageURL}" target="_blank"><img src="${directURL}" border="0" alt="Untitled"></img></a>`
    },
    { name: 'forum_hotlink', text: `[url=${pageURL}][img]${directURL}[/img][/url]` },
    {
      name: 'website_hotlink',
      text: `<a href="${pageURL}" target="_blank"><img src="${directURL}" border="0"></img></a>`
    }
  ]
}
