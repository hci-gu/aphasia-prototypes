import styled from '@emotion/styled'
import { Button } from '@mantine/core'
import { useState } from 'react'
import { Editor } from 'slate'
import * as api from '../../api'
import { useAtomValue } from 'jotai'
import { prepromptAtom } from '../../state'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TextContainer = styled.div`
  width: 100%;
  min-height: 400px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 16px;
`

const Rewriter = ({ editor }) => {
  const [generatedText, setGeneratedText] = useState('hallå eller')
  const prePrompt = useAtomValue(prepromptAtom)

  const onClick = async () => {
    const text = Editor.string(editor, [])

    setGeneratedText(await api.rewriteText(text, prePrompt))
  }

  return (
    <Root>
      <Button w={180} onClick={onClick}>
        Skriv om text
      </Button>
      <TextContainer>
        <p>{generatedText}</p>
      </TextContainer>
    </Root>
  )
}

export default Rewriter
