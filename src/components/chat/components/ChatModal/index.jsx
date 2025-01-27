import React, { useState } from 'react'
import styles from './styles.module.css'
import markdownStyles from './markdown.module.css'

function ChatModal() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setError(null)
    setAnswer(null)

    try {
      const response = await fetch('http://localhost:4001/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setAnswer(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Sorry, something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modal}>
      <h2 className={styles.title}>Ask Lido Documentation</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question to Lido documentation..."
            className={styles.input}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Loading...' : 'Ask'}
        </button>
      </form>

      <div className={styles.answersContainer}>
        {error && <div className={styles.error}>{error}</div>}

        {answer && (
          <>
            <div className={markdownStyles.answer} dangerouslySetInnerHTML={{ __html: answer.html }} />
            {Array.isArray(answer.sources) && answer.sources.length > 0 && (
              <div className={markdownStyles.sources}>
                <h4 className={markdownStyles.sourcesTitle}>Sources:</h4>
                <ul className={markdownStyles.sourcesList}>
                  {answer.sources.map((source, i) => (
                    <li key={i} className={markdownStyles.sourcesItem}>
                      <a
                        href={source.path}
                        className={markdownStyles.sourcesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.title || source.path}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatModal
