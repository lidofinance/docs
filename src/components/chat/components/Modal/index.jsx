import React, { useEffect } from 'react'
import { useModal } from '@site/src/hooks/useModal'
import styles from './styles.module.css'

function Modal() {
  const { isOpen, content, closeModal } = useModal()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={closeModal}>
          ×
        </button>
        {content}
      </div>
    </div>
  )
}

export default Modal
