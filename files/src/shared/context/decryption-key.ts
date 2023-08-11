import { DecryptionKey } from '@/shared/utils/files-encryption'
import React from 'react'

export const DecryptionKeyContext = React.createContext<undefined | null | 'error' | DecryptionKey>(undefined)