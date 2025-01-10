import { Menu, Button, Text, rem, Textarea, Flex } from '@mantine/core'
import { useAtom, useSetAtom } from 'jotai'
import { emailsAtom, INITIAL_EMAILS_STATE, profileAtom } from '../state'
import { IconUser } from '@tabler/icons-react'
import { useState } from 'react'

export const ProfileTextArea = () => {
  const [profile, saveProfile] = useAtom(profileAtom)
  const [profileText, setProfileText] = useState(profile)

  return (
    <Flex direction="column" p={8}>
      <Textarea
        value={profileText}
        onChange={(e) => setProfileText(e.target.value)}
        autosize
        mihh={400}
      />
      <Button onClick={() => saveProfile(profileText)} mt={8}>
        Spara
      </Button>
    </Flex>
  )
}

const EditProfile = () => {
  const [profile, saveProfile] = useAtom(profileAtom)
  const [profileText, setProfileText] = useState(profile)
  const setEmails = useSetAtom(emailsAtom)

  return (
    <Menu shadow="md" width={400}>
      <Menu.Target>
        <Button variant="outline">
          <IconUser style={{ marginRight: 4 }} size={16} />
          Editera profil
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Flex justify="center">
            <IconUser style={{ marginRight: 4 }} size={16} />
            Information om dig själv
          </Flex>
        </Menu.Label>
        <Menu.Divider />
        <ProfileTextArea />
        <Flex justify="center" pb={4}>
          <Button
            onClick={() => {
              setEmails(INITIAL_EMAILS_STATE)
              window.location.reload()
            }}
            variant="light"
          >
            Rensa mail
          </Button>
        </Flex>
      </Menu.Dropdown>
    </Menu>
  )
}

export default EditProfile
