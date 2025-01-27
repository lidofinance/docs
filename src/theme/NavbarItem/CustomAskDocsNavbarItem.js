import React from 'react'
import { useModal } from '@site/src/hooks/useModal'
import ChatModal from '@site/src/components/chat/components/ChatModal'

export default function CustomAskDocsNavbarItem() {
  const { openModal } = useModal()

  return (
    <button
      className="clean-btn navbar__item navbar__link"
      onClick={() => openModal(<ChatModal />)}
      aria-label="Ask Docs"
    >
      💬 Ask Docs
    </button>
  )
}
