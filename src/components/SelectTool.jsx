import { Menu, Button, Text, rem, Input } from '@mantine/core'
import { IconTool } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { activeToolAtom, availableTools, toolSettingsAtom } from '../state'
import { useEffect, useState } from 'react'

const SelectTool = () => {
  const [opened, setOpened] = useState(false)
  const [activeTool, setActiveTool] = useAtom(activeToolAtom)
  const [toolSettings, setToolSettings] = useAtom(toolSettingsAtom)
  const [settings, updateSettings] = useState(toolSettings)

  useEffect(() => {
    updateSettings(toolSettings)
  }, [toolSettings])

  return (
    <Menu shadow="md" width={200} opened={opened}>
      <Menu.Target>
        <Button onClick={() => setOpened(!opened)}>
          <IconTool style={{ marginRight: 4 }} size={16} />
          Byt verktyg
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Verktyg</Menu.Label>
        {availableTools.map((tool) => (
          <Menu.Item
            onClick={() => {
              setActiveTool(tool)
              setOpened(false)
            }}
          >
            <Text
              size="sm"
              style={{ fontWeight: activeTool === tool ? 800 : 400 }}
            >
              {tool}
            </Text>
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Label>Inställningar AutoComplete</Menu.Label>
        <Menu.Item>
          <Input.Wrapper label="Delay">
            <Input
              value={settings.autoCompleteDelay}
              type="number"
              onChange={(e) => {
                updateSettings({
                  ...settings,
                  autoCompleteDelay: e.currentTarget.value,
                })
              }}
            />
          </Input.Wrapper>
        </Menu.Item>
        <Menu.Item>
          <Input.Wrapper label="Max words">
            <Input
              value={settings.autoCompleteMaxWords}
              type="number"
              onChange={(e) => {
                updateSettings({
                  ...settings,
                  autoCompleteMaxWords: e.currentTarget.value,
                })
              }}
            />
          </Input.Wrapper>
        </Menu.Item>
        <Menu.Item>
          <Button
            onClick={() => {
              setToolSettings({
                ...settings,
                autoCompleteDelay: Math.max(100, settings.autoCompleteDelay),
              })
              setOpened(false)
            }}
          >
            Spara
          </Button>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export default SelectTool
