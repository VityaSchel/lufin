import { Link } from 'react-router'
import { LanguageSwitch } from '$features/language-switch'
import Logo from '$assets/logo.svg'
import BiLogoGithub from '$assets/icons/github-logo.svg'

export function AppBar() {
  return (
    <header className="w-full flex justify-center items-center h-[60px] md:h-[72px] bg-[#212932] px-[15px]">
      <nav className="max-w-[var(--max-width)] w-full flex justify-between items-center">
        <div className="flex flex-col px450:flex-row items-center px450:gap-4">
          <Link
            to="/"
            className='font-extrabold text-3xl font-["SF Pro Display", var(--fonts)] flex items-center gap-1.5'
          >
            <Logo />
            Lufin
          </Link>
          <span className="px450:mt-3 tracking-tight text-gray-600 text-xs px450:text-base ml-8 px450:ml-0">
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
