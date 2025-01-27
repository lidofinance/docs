import React from 'react'
import Modal from '@site/src/components/chat/components/Modal'

export default function Root({ children }) {
  return (
    <>
      {children}
      <Modal />
    </>
  )
}
