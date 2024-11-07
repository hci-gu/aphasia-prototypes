import { Menu, Button, Text, rem, Textarea, Flex } from '@mantine/core'
import { useAtom } from 'jotai'
import { profileAtom } from '../state'
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
      </Menu.Dropdown>
    </Menu>
  )
}

export default EditProfile
