import React, { useEffect, useLayoutEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, Modal } from '@mantine/core'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

import '@mantine/core/styles.css'
import { useAtomValue } from 'jotai'
import { profileAtom } from './state'
import { useDisclosure } from '@mantine/hooks'
import { ProfileTextArea } from './components/EditProfile'

const Root = () => {
  const profile = useAtomValue(profileAtom)
  const [opened, { open, close }] = useDisclosure(!profile)

  useLayoutEffect(() => {
    if (!!profile) {
      close()
    }
  }, [profile])

  return (
    <MantineProvider>
      <Modal opened={opened} onClose={close} title="Set profile">
        <ProfileTextArea />
      </Modal>
      <App />
    </MantineProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
)
