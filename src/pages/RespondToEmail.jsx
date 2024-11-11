import React, { useLayoutEffect } from 'react'
import { Flex, Textarea } from '@mantine/core'
import { prepromptAtom } from '../state'
import { useAtom } from 'jotai'
import CustomEditor from '../components/Editor'

const today = new Date()
let nextSaturday = new Date()
nextSaturday.setDate(today.getDate() + ((6 - today.getDay()) % 7) + 1)
const nextSaturdayString = nextSaturday.toLocaleDateString('sv-SE', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const baseEmail = `
Hej,

Vi vill gärna bjuda in dig till ett födelsedagsfirande som vi planerar att hålla nästa helg, och vi hoppas att du kan vara med och fira!

Här är detaljerna för firandet: ${nextSaturdayString} kl. 18:00 På Restaurang Måltiden, Centrala Gatan 12

För att göra det extra speciellt vill vi att du väljer din favoritmat från restaurangens meny i förväg, så vi kan säkerställa att alla får njuta av något de gillar. Skicka gärna tillbaka med din matpreferens från menyn nedan, så ordnar vi det åt dig:

Alternativ 1: Grillad lax med potatisgratäng och sallad
Alternativ 2: Vegetarisk pasta med svamp och spenat
Alternativ 3: Hamburgare med pommes och tillbehör
Om ingen av dessa rätter tilltalar dig, hör av dig så hittar vi ett alternativ!

Vi ser fram emot en rolig kväll och hoppas du kan vara med och fira!

Hör gärna av dig om du har några frågor.

Med vänliga hälsningar,
Anna
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
