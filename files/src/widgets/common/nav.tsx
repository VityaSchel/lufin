import Link from 'next/link'
import { LanguageSwitch } from '$features/language-switch'
import Logo from '$assets/logo.svg'

export function AppBar() {
  return (
    <header className="w-full flex justify-center items-center h-[60px] md:h-[72px] bg-[#212932] px-[15px]">
      <nav className="max-w-[var(--max-width)] w-full flex justify-between items-center">
        <Link href='/files' className='font-extrabold text-3xl font-["SF Pro Display", var(--fonts)] flex items-center gap-1.5'>
          <Logo />
          Lufin
        </Link>
        <LanguageSwitch />
      </nav>
    </header>
  )
}