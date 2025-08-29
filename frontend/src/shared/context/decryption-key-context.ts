import React from 'react'
import type { DecryptionKey } from 'lufin-lib'

export type DecryptionKeyContextType = undefined | null | 'error' | DecryptionKey

export const DecryptionKeyContext = React.createContext<DecryptionKeyContextType>(undefined)
