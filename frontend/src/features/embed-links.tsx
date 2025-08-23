import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getEmbedLinks, type EmbedLinkName } from '$shared/embed-links'
import { CopyIconButton } from '$shared/ui/copy-icon-button'
import { TextField } from '$shared/ui/components/text-field'
import { m } from '$m'

const embedLinkNamesTranslations: Record<EmbedLinkName, string> = {
  direct_link: m.embedLinksNames_directLink(),
  markdown_link: m.embedLinksNames_markdownLink(),
  markdown_image: m.embedLinksNames_markdownImage(),
  forum_thumbnail: m.embedLinksNames_forumThumbnail(),
  website_thumbnail: m.embedLinksNames_websiteThumbnail(),
  forum_hotlink: m.embedLinksNames_forumHotlink(),
  website_hotlink: m.embedLinksNames_websiteHotlink()
}

export function EmbedLinks({ pageId, file }: { pageId: string; file: string }) {
  return (
    <section className="mt-12 w-[800px] max-w-full">
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>{m.embedLinksSection()}</AccordionSummary>
        <AccordionDetails>
          <div className="flex flex-col gap-1">
            {getEmbedLinks(pageId, file).map(({ name, text }, i) => (
              <TextField
                key={i}
                variant="outlined"
                label={embedLinkNamesTranslations[name]}
                value={text}
                readOnly
                rightAdornment={
                  <div className="flex mr-2">
                    <CopyIconButton content={text} />
                  </div>
                }
              />
            ))}
          </div>
        </AccordionDetails>
      </Accordion>
    </section>
  )
}
