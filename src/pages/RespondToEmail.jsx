import React, { useLayoutEffect } from 'react'
import { Flex, Textarea } from '@mantine/core'
import { prepromptAtom } from '../state'
import { useAtom } from 'jotai'
import CustomEditor from '../components/Editor'

const baseEmail = `
Hej,

Vi behöver tyvärr boka om din tandläkartid som var planerad till måndag 2 oktober kl. 10:30. Vi ber om ursäkt för besväret och hoppas att någon av följande tider nästa vecka passar dig:
Måndag 9 oktober kl. 14:00
Onsdag 11 oktober kl. 09:30
Fredag 13 oktober kl. 15:15
Vänligen återkom med den tid som passar bäst för dig, så bokar vi in dig på nytt. Om ingen av dessa tider fungerar, låt oss veta så hittar vi ett alternativ.
Tack för din förståelse och hör gärna av dig om du har några frågor.

Med vänlig hälsning,

Dr. Erik Larsson
Tandvårdskliniken Leende
070-123 45 67
info@leendetandvard.se
`

const RespondToEmail = () => {
  const [preprompt, setPreprompt] = useAtom(prepromptAtom)

  useLayoutEffect(() => {
    setPreprompt({
      text: baseEmail,
      type: 'email',
    })
  }, [])

  return (
    <Flex direction="column" gap={8}>
      <Textarea
        value={preprompt?.text || ''}
        style={{ width: `80vw`, margin: '0 auto' }}
        autosize
        onChange={(e) =>
          setPreprompt({
            text: e.currentTarget.value,
            type: 'email',
          })
        }
      />
      <CustomEditor />
    </Flex>
  )
}

export default RespondToEmail
