import { useEffect, useLayoutEffect } from 'react'
import CustomEditor from '../components/Editor'
import { useAtom } from 'jotai'
import { prepromptAtom } from '../state'

const EmptyPage = () => {
  const [_, setPreprompt] = useAtom(prepromptAtom)

  useLayoutEffect(() => {
    setPreprompt(null)
  }, [])

  return (
    <div style={{ paddingTop: 64 }}>
      <CustomEditor />
    </div>
  )
}

export default EmptyPage
