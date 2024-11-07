import styled from '@emotion/styled'
import { useAtomValue } from 'jotai'
import { prepromptAtom } from '../../state'
import { useEffect, useState } from 'react'
import { Button, Center, Flex, Loader, SimpleGrid, Text } from '@mantine/core'
import { Editor, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import useApi from '../../api/useApi'

const Root = styled.div``

const POSITIVE = 'positive'
const NEGATIVE = 'negative'
const NEUTRAL = 'neutral'

const typeMatcher = (typeText) => {
  if (typeText.match(/pos/i)) {
    return POSITIVE
  }
  if (typeText.match(/neg/i)) {
    return NEGATIVE
  }

  return NEUTRAL
}

const colorForType = (type) => {
  if (type === POSITIVE) {
    return 'green'
  }
  if (type === NEGATIVE) {
    return 'red'
  }

  return 'blue'
}

const ResponseButtons = ({ editor }) => {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [buttons, setButtons] = useState([])
  const preprompt = useAtomValue(prepromptAtom)

  useEffect(() => {
    if (!preprompt) {
      return
    }

    const run = async () => {
      setLoading(true)

      const buttonsTexts = await api.suggestResponseButtons()
      const buttons = buttonsTexts.map((text) => {
        const [type, ...rest] = text.split(':')

        return {
          text: rest,
          type: typeMatcher(type),
        }
      })

      setButtons(buttons)
      setLoading(false)
    }

    run()
  }, [preprompt])

  const onButtonClick = async (button) => {
    const text = Editor.string(editor, [])
    const newText = text + button.text

    const finalText = await api.rewriteText(newText)
    if (!editor.selection) {
      ReactEditor.focus(editor)
    }
    Transforms.select(editor, {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    })
    Transforms.delete(editor)

    Editor.insertText(editor, finalText)
  }

  return (
    <Root>
      <SimpleGrid cols={2}>
        {!loading &&
          buttons.map((button) => (
            <Button
              w={'100%'}
              h={64}
              color={colorForType(button.type)}
              onClick={() => onButtonClick(button)}
            >
              <Text lineClamp={2}>{button.text}</Text>
            </Button>
          ))}
      </SimpleGrid>
      {loading && (
        <Center>
          <Loader />
        </Center>
      )}
    </Root>
  )
}

export default ResponseButtons
