import ru from 'date-fns/locale/ru'
import uk from 'date-fns/locale/uk'
import be from 'date-fns/locale/be'
import en from 'date-fns/locale/en-US'
import bg from 'date-fns/locale/bg'
import cs from 'date-fns/locale/cs'
import da from 'date-fns/locale/da'
import nl from 'date-fns/locale/nl'
import et from 'date-fns/locale/et'
import fi from 'date-fns/locale/fi'
import fr from 'date-fns/locale/fr'
import de from 'date-fns/locale/de'
import el from 'date-fns/locale/el'
import hu from 'date-fns/locale/hu'
import it from 'date-fns/locale/it'
import lv from 'date-fns/locale/lv'
import lt from 'date-fns/locale/lt'
import nb from 'date-fns/locale/nb'
import pl from 'date-fns/locale/pl'
import pt from 'date-fns/locale/pt'
import ro from 'date-fns/locale/ro'
import sk from 'date-fns/locale/sk'
import sl from 'date-fns/locale/sl'
import es from 'date-fns/locale/es'
import sv from 'date-fns/locale/sv'
import tr from 'date-fns/locale/tr'

export const getDateFnsLocale = (locale: string) => {
  switch (locale) {
    case 'ru': return ru
    case 'uk': return uk
    case 'be': return be
    case 'en': return en
    case 'bg': return bg
    case 'cs': return cs
    case 'da': return da
    case 'nl': return nl
    case 'et': return et
    case 'fi': return fi
    case 'fr': return fr
    case 'de': return de
    case 'el': return el
    case 'hu': return hu
    case 'it': return it
    case 'lv': return lv
    case 'lt': return lt
    case 'nb': return nb
    case 'pl': return pl
    case 'pt': return pt
    case 'ro': return ro
    case 'sk': return sk
    case 'sl': return sl
    case 'es': return es
    case 'sv': return sv
    case 'tr': return tr
  }
}