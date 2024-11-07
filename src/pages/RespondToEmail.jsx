import React, { useLayoutEffect } from 'react'
import { Flex, Textarea } from '@mantine/core'
import { prepromptAtom } from '../state'
import { useAtom } from 'jotai'
import CustomEditor from '../components/Editor'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
let mondayNextWeek = new Date(today)
mondayNextWeek.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7))
let wednesdayNextWeek = new Date(mondayNextWeek)
wednesdayNextWeek.setDate(mondayNextWeek.getDate() + 2)
let fridayNextWeek = new Date(mondayNextWeek)
fridayNextWeek.setDate(mondayNextWeek.getDate() + 4)

const baseEmail = `
Hej,

Vi behöver tyvärr boka om din tandläkartid som var planerad till imorgon ${tomorrow.toLocaleDateString(
  'sv-SE',
  {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }
)} kl. 10:30. Vi ber om ursäkt för besväret och hoppas att någon av följande tider nästa vecka passar dig:
${mondayNextWeek.toLocaleDateString('sv-SE', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})} kl. 10:30
${wednesdayNextWeek.toLocaleDateString('sv-SE', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})} kl. 09:30
${fridayNextWeek.toLocaleDateString('sv-SE', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})} kl. 15:15
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
