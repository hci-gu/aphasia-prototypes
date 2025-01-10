import { Menu, Button, Text, rem } from '@mantine/core'
import {
  IconPhoto,
  IconMail,
  IconMessageCircle,
  IconArticle,
} from '@tabler/icons-react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'

const pages = [
  {
    title: 'Tom sida',
    icon: <IconArticle style={{ width: rem(14), height: rem(14) }} />,
    path: '/',
  },
  {
    title: 'Beskriv bild',
    icon: <IconPhoto style={{ width: rem(14), height: rem(14) }} />,
    path: '/photo',
  },
  {
    title: 'Svara på mail',
    icon: <IconMail style={{ width: rem(14), height: rem(14) }} />,
    path: '/email',
  },
  // {
  //   title: 'Chatta',
  //   icon: <IconMessageCircle style={{ width: rem(14), height: rem(14) }} />,
  //   path: '/chat',
  // },
]

const SelectPage = () => {
  let location = useLocation()
  const activePage = pages.find((page) => location.pathname === page.path)

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        {/* <IconPackage style={{ marginRight: 4 }} size={16} /> */}
        <Button>Byt uppgift</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Uppgift</Menu.Label>
        {pages.map((page) => (
          <Link to={page.path} key={`Page_${page.path}`}>
            <Menu.Item leftSection={page.icon}>
              <Text
                size="sm"
                style={{ fontWeight: activePage === page ? 800 : 400 }}
              >
                {page.title}
              </Text>
            </Menu.Item>
          </Link>
        ))}
        <Menu.Divider />
      </Menu.Dropdown>
    </Menu>
  )
}

export default SelectPage
