import { Flex, Image } from '@mantine/core'
import CustomEditor from '../components/Editor'
import { useLayoutEffect } from 'react'
import { prepromptAtom } from '../state'
import { useAtom } from 'jotai'

const PhotoPage = () => {
  const [_, setPreprompt] = useAtom(prepromptAtom)

  useLayoutEffect(() => {
    setPreprompt({
      text: `Det här är en bild av en hund och en katt som sitter bredvid varandra på en soffa, tittandes ut genom ett fönster mot en upplyst stad. På fönsterbrädan står några dekorativa vaser, och rummet är svagt upplyst av en lampa. Bildens mest framträdande element är hundens och kattens lugna närvaro, samt den stämningsfulla utsikten över staden i kvällsljus.`,
      type: 'photo',
    })
  }, [])

  return (
    <Flex justify="center" align="center" direction="column" gap={16}>
      <Image
        src="/images/dog_cat.png"
        alt="A photo of a cat"
        w={800}
        h={500}
        radius={8}
      />
      <CustomEditor />
    </Flex>
  )
}

export default PhotoPage
