import { Link } from '$shared/ui/components/link'
import { Link as ReactRouterLink } from 'react-router'
import { LanguageSwitch } from '$features/language-switch'
import Logo from '$assets/logo.svg'
import BiLogoGithub from '$assets/icons/github-logo.svg?react'
import { m } from '$m'

export function AppBar() {
  return (
    <header className="w-full flex justify-center items-center h-[60px] md:h-[72px] bg-[#212932] px-[15px]">
      <nav className="max-w-(--max-width) w-full flex justify-between items-center">
        <div className="flex items-center gap-4 px450:gap-8">
          <div className="flex flex-col items-center">
            <ReactRouterLink
              to="/"
              className='font-extrabold text-3xl font-["SF Pro Display", var(--fonts)] flex items-center gap-1.5'
            >
              <Logo />
              Lufin
            </ReactRouterLink>
            <span className="tracking-tight text-gray-600 text-xs ml-[34px]">
              by{' '}
              <a
                href="https://hloth.dev"
                rel="noopener noreferrer"
                target="_blank"
                className="font-medium"
              >
                hloth.dev
              </a>
            </span>
          </div>
          <Link href="/uploads" variant="dimmed">
            {m.myFiles()}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/VityaSchel/lufin"
            rel="noopener noreferrer"
            target="_blank"
            className="rounded-full"
          >
            <BiLogoGithub fontSize={32} />
          </a>
          <LanguageSwitch />
        </div>
      </nav>
    </header>
  )
}
