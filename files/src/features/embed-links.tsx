import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getEmbedLinks } from '$shared/embed-links'
import { CopyIconButton } from '$shared/ui/copy-icon-button'
import { TextField } from '$shared/ui/components/text-field'
import { useTranslation } from 'next-i18next'

export function EmbedLinks({ pageID, file }: { pageID: string, file: string }) {
  const { t } = useTranslation('filesharing')

  return (
    <section className='mt-12 w-[800px] max-w-full'>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          {t('embed_links_section')}
        </AccordionSummary>
        <AccordionDetails>
          <div className='flex flex-col gap-1'>
            {getEmbedLinks(pageID, file).map(({ name, text }) => (
              <TextField
                variant='outlined'
                label={t(`embed_links_names.${name}`)}
                value={text}
                readOnly
                rightAdornment={
                  <div className='flex mr-2'>
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