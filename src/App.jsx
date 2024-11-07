import styled from '@emotion/styled'
import React, { useState } from 'react'
import DarkModeToggle from './components/DarkModeToggle'
import { AppShell, Button, Card, Flex, Text, Textarea } from '@mantine/core'
import * as api from './api'
import { useNextWords } from './state'
import RespondToEmail from './pages/RespondToEmail'
import SelectPage from './components/SelectPage'
import { createBrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import EmptyPage from './pages/Empty'
import PhotoPage from './pages/PhotoPage'
import SelectTool from './components/SelectTool'
import EditProfile from './components/EditProfile'

const Container = styled.div`
  margin: 0 auto;
  width: 90%;
  padding-top: 80px;
  padding-bottom: 196px;
`

const AppContainer = () => {
  return (
    <AppShell>
      <AppShell.Header h={64} p={16}>
        <Flex align="center" justify="end" gap={8}>
          <EditProfile />
          <SelectTool />
          <SelectPage />
        </Flex>
      </AppShell.Header>
      <Container>
        <Outlet />
      </Container>
    </AppShell>
  )
}

const App = ({ Outlet }) => {
  return (
    <Routes>
      <Route path="/" element={<AppContainer />}>
        <Route path="" element={<EmptyPage />} />
        <Route path="photo" element={<PhotoPage />} />
        <Route path="email" element={<RespondToEmail />} />
        <Route path="chat" element={<RespondToEmail />} />
      </Route>
    </Routes>
  )
}

export default App
