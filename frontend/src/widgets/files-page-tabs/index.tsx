import React from 'react'
import styles from './styles.module.scss'
import cx from 'classnames'

export function FilesPageTabs({ value, onChange, tabs }: {
  value: string
  onChange: (newTab: string) => void
  tabs: { key: string, title: string, content: React.ReactNode }[]
}) {
  const tab = React.useMemo(() => tabs.find(t => t.key === value) ?? tabs[0], [tabs, value])

  return (
    <section>
      <div className={styles.tabSelector}>
        {tabs.map(tab => (
          <button 
            key={tab.key} 
            onClick={() => onChange(tab.key)} 
            className={cx(styles.tab, { [styles.active]: value === tab.key })}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {tab.content}
      </div>
    </section>
  )
}