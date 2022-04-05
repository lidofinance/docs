import React from 'react'
import Link from '@docusaurus/Link'
import PropTypes from 'prop-types'

import './grid.css'

export default function GridLink({
  Icon,
  title,
  subtitle,
  className,
  ...props
}) {
  return (
    <Link {...props} className="grid-link">
      {Icon}
      <div>
        {title && <p className="title">{title}</p>}
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
    </Link>
  )
}

GridLink.propTypes = {
  Icon: PropTypes.element,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
}
