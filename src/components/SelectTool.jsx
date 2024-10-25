import { Menu, Button, Text, rem } from '@mantine/core'
import { IconTool } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { activeToolAtom, availableTools } from '../state'

const SelectTool = () => {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom)

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button>
          <IconTool style={{ marginRight: 4 }} size={16} />
          Byt verktyg
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Verktyg</Menu.Label>
        {availableTools.map((tool) => (
          <Menu.Item onClick={() => setActiveTool(tool)}>
            <Text
              size="sm"
              style={{ fontWeight: activeTool === tool ? 800 : 400 }}
            >
              {tool}
            </Text>
          </Menu.Item>
        ))}
        <Menu.Divider />
      </Menu.Dropdown>
    </Menu>
  )
}

export default SelectTool
