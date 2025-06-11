export function getEmbedLinks(pageId: string, file: string) {
  const pageURL = `${window.location.origin}/${pageId}/${encodeURIComponent(file)}`
  const directURL = `${import.meta.env.VITE_API_URL}/page/${pageId}/${encodeURIComponent(file)}`
  
  return [
    { name: 'direct_link', text: directURL },
    { name: 'markdown_link', text: `[Untitled](${directURL})` },
    { name: 'markdown_image', text: `[![Untitled](${directURL})](${pageURL})` },
    { name: 'forum_thumbnail', text: `[url=${pageURL}][img]${directURL}[/img][/url]` },
    { name: 'website_thumbnail', text: `<a href="${pageURL}" target="_blank"><img src="${directURL}" border="0" alt="Untitled"></img></a>` },
    { name: 'forum_hotlink', text: `[url=${pageURL}][img]${directURL}[/img][/url]` },
    { name: 'website_hotlink', text: `<a href="${pageURL}" target="_blank"><img src="${directURL}" border="0"></img></a>` }
  ]
}