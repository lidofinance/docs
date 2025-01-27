import ComponentTypes from '@theme/NavbarItem/ComponentTypes'
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem'

export default function NavbarItem(props) {
  const ComponentType = ComponentTypes[props.type] || DefaultNavbarItem
  return <ComponentType {...props} />
}
