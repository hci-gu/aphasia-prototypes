import { Flex, Image } from '@mantine/core'
import CustomEditor from '../components/Editor'
import { useLayoutEffect } from 'react'
import { prepromptAtom } from '../state'
import { useAtom } from 'jotai'

const PhotoPage = () => {
  const [_, setPreprompt] = useAtom(prepromptAtom)

  useLayoutEffect(() => {
    setPreprompt({
      text: `Bilden visar ett idylliskt kustlandskap vid solnedgången. I förgrunden finns en strand med grunt vatten, där solens gyllene strålar reflekteras och skapar en varm, glödande effekt på sanden och vattnet. Två personer promenerar eller springer längs stranden, medan en cyklist syns i bakgrunden på en liten stig som leder till huset.

Det centrala huset har en charmig, klassisk stil med grågrön fasad, mörka fönsterkarmar och en veranda som sträcker sig längs framsidan. Huset har en rejäl skorsten och är omgivet av buskage och några små träd.

I bakgrunden reser sig ett träd med krokiga grenar, som skapar en dramatisk siluett mot himlen. Himlen är fylld av fluffiga, orange- och rosafärgade moln som belyses av den nedgående solen, medan en flock måsar svävar högt uppe i luften, till synes lekfulla och fria.

Solens strålar sträcker sig ut över scenen, och hela bilden fångar en känsla av lugn och harmoni i naturen, med en subtil rörelse från både människor och djur.`,
      type: 'photo',
    })
  }, [])

  return (
    <Flex justify="center" align="center" direction="column" gap={16}>
      <Image src="/images/house.png" alt="A photo of a cat" w={500} h={500} />
      <CustomEditor />
    </Flex>
  )
}

export default PhotoPage
