import React, { useEffect, useLayoutEffect, useState } from 'react'
import {
  Button,
  Flex,
  List,
  Loader,
  Space,
  Text,
  Textarea,
} from '@mantine/core'
import { emailsAtom, prepromptAtom, selectedEmailAtom } from '../state'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import CustomEditor from '../components/Editor'
import { useHover } from '@mantine/hooks'
import { IconMail } from '@tabler/icons-react'
import { IconInbox } from '@tabler/icons-react'
import { IconEye } from '@tabler/icons-react'
import useApi from '../api/useApi'
import { IconEyeClosed } from '@tabler/icons-react'

const Email = ({ id, subject, body, from, read }) => {
  const { hovered, ref } = useHover()
  const selectedEmail = useAtomValue(selectedEmailAtom)
  const selected = selectedEmail === id

  return (
    <Flex
      w="100%"
      h="100%"
      style={{
        background: selected
          ? '#26547C'
          : hovered
          ? 'rgba(0, 0, 0, 0.1)'
          : 'transparent',
        cursor: 'pointer',
        color: selected ? 'white' : 'black',
      }}
    >
      {!read && (
        <div style={{ width: 8, height: '99%', background: '#26547C' }} />
      )}
      <Flex
        direction="column"
        p="xs"
        style={{
          borderBottom: '1px solid rgba(0, 0, 0, 0.25)',
          width: '98%',
        }}
      >
        <Text fw={800}>{from}</Text>
        <Text
          // fw={500}
          style={{
            color: selected ? 'white' : read ? 'black' : '#26547C',
            fontWeight: read ? 500 : 700,
          }}
        >
          {subject}
        </Text>
        <Text lineClamp={1} truncate="end">
          {body}
        </Text>
      </Flex>
    </Flex>
  )
}

const EmailList = () => {
  const [emails, setEmails] = useAtom(emailsAtom)
  const setSelectedEmail = useSetAtom(selectedEmailAtom)

  return (
    <Flex direction="column" gap={8} w={300}>
      <Flex justify="center" align="center" gap={4}>
        <IconInbox size={32} />
        <Text fz={18}>Inbox</Text>
      </Flex>
      <Flex
        direction="column"
        style={{
          border: '1px solid rgba(0, 0, 0, 0.25)',
          overflowY: 'scroll',
        }}
        h={'80vh'}
      >
        {emails.map((email) => (
          <div
            style={{ height: 100, width: 300 }}
            onClick={() => {
              setEmails((emails) => [
                ...emails.map((e) => ({
                  ...e,
                  read: e.id === email.id ? true : e.read,
                })),
              ])
              setSelectedEmail(email.id)
            }}
          >
            <Email key={email.id} {...email} />
          </div>
        ))}
        <Space h={24} />
        <Flex justify="center" align="center">
          <Text>Du har inga fler mejl</Text>
        </Flex>
        <Space h={24} />
      </Flex>
    </Flex>
  )
}

const ReceivedEmail = ({ email }) => {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [simplified, setSimplified] = useState(null)
  const [showSimplified, setShowSimplified] = useState(false)

  const simplify = async () => {
    if (!simplified) {
      setLoading(true)
      const simplerText = await api.simplifyText(email.body)
      setSimplified(simplerText)
      setLoading(false)
    }
    setShowSimplified(!showSimplified)
  }

  return (
    <Flex
      direction="column"
      style={{ border: '1px solid rgba(0, 0, 0, 0.25)', borderRadius: 6 }}
    >
      <Flex direction="row" p={8} ml={8} justify="space-between" align="center">
        <Text fz={16} fw={700}>
          {email?.from}
        </Text>
        {email.from !== 'Du' && (
          <>
            {showSimplified ? (
              <Button
                onClick={() => setShowSimplified(false)}
                variant="outline"
              >
                <IconEyeClosed style={{ marginRight: 8 }} />
                Visa original
              </Button>
            ) : (
              <Button variant="outline" onClick={simplify} disabled={loading}>
                {loading ? (
                  <Loader size={16} mr={8} />
                ) : (
                  <IconEye style={{ marginRight: 8 }} />
                )}
                Förenkla
              </Button>
            )}
          </>
        )}
      </Flex>
      <Textarea
        value={
          showSimplified && simplified ? simplified : email ? email.body : ''
        }
        style={{
          width: `60vw`,
          margin: '0 auto',
          outline: 'none',
          paddingLeft: 16,
          paddingBottom: 8,
        }}
        variant="unstyled"
        autosize
      />
    </Flex>
  )
}

const SelectedEmail = () => {
  const selectedEmail = useAtomValue(selectedEmailAtom)
  const email = useAtomValue(emailsAtom).find((e) => e.id === selectedEmail)
  const setPrePrompt = useSetAtom(prepromptAtom)

  useEffect(() => {
    if (email) {
      setPrePrompt({
        text: email?.body,
        type: 'email',
      })
    }
  }, [selectedEmail, email])

  if (!email) {
    return (
      <Flex direction="column" justify="center" align="center" h={250}>
        <IconMail size={64} />
        <Text fz={24} fw={700}>
          Inget mejl valt
        </Text>
        <Text fz={16}>Välj ett till vänster</Text>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap={8}>
      <ReceivedEmail email={email} key={email.body} />
      <Flex direction="column" gap={8}>
        {email.responses.map((response, i) => (
          <ReceivedEmail key={i} email={response} />
        ))}
      </Flex>
    </Flex>
  )
}

const RespondToEmail = () => {
  const selectedEmail = useAtomValue(selectedEmailAtom)
  const setEmails = useSetAtom(emailsAtom)

  const sendEmail = (text) => {
    if (!selectedEmail) {
      return
    }

    setEmails((emails) =>
      emails.map((email) =>
        email.id === selectedEmail
          ? {
              ...email,
              responses: [
                ...email.responses,
                {
                  body: text,
                  from: 'Du',
                },
              ],
            }
          : email
      )
    )
  }

  return (
    <Flex gap={8}>
      <EmailList />
      <Flex direction="column" gap={8} h={'100vh'}>
        <SelectedEmail />
        <CustomEditor onActionClick={sendEmail} />
        <Space h={400} />
      </Flex>
    </Flex>
  )
}

export default RespondToEmail
