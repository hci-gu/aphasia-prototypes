import styled from '@emotion/styled'
import React from 'react'
import DarkModeToggle from './components/DarkModeToggle'
import { AppShell, Flex } from '@mantine/core'

const Container = styled.div`
  margin: 0 auto;
  width: 90%;
`

const App = () => {
  return (
    <AppShell>
      <AppShell.Header h={64} p={16}>
        <Flex align="center" justify="end">
          <DarkModeToggle />
        </Flex>
      </AppShell.Header>
      <Container>
        <h1>Template</h1>
        <div>now build stuff</div>
      </Container>
    </AppShell>
  )
}

export default App
