const express = require('express')
const fs = require('fs')
const OpenAI = require('openai')
const cors = require('cors')
require('dotenv').config()
const { marked } = require('marked')
const hljs = require('highlight.js')

const app = express()
const PORT = 4001

app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function loadDocuments() {
  const documents = {}
  fs.readdirSync('docs').forEach((file) => {
    if (fs.statSync(`docs/${file}`).isFile()) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        try {
          documents[file] = fs.readFileSync(`docs/${file}`, 'utf8')
        } catch (error) {
          console.error('Error reading document:', error)
        }
      }
    }
  })
  return documents
}

app.use(express.json())

app.post('/document-embeddings', async (req, res) => {
  const documents = await loadDocuments()
  try {
    const embeddings = await createEmbeddings(documents)
    res.json({ embeddings })
  } catch (error) {
    console.error('Error creating embeddings:', error)
    res.status(500).json({ error: 'Failed to create embeddings' })
  }
})

async function createEmbeddings(input) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: typeof input === 'string' ? input : input.question,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error creating embeddings:', error)
    throw new Error('Failed to create embeddings')
  }
}

function cosineSimilarity(embedding1, embedding2) {
  const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0)
  const norm1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0))
  const norm2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (norm1 * norm2)
}

async function getDocumentContext(documents, question, topN = 3) {
  let context = ''
  const questionEmbedding = await createEmbeddings({ question })
  const savedEmbeddings = JSON.parse(fs.readFileSync('embeddings.json', 'utf8'))

  const similarities = []
  for (const [file, chunks] of Object.entries(savedEmbeddings)) {
    for (const chunk of chunks) {
      const similarity = cosineSimilarity(questionEmbedding, chunk.embedding)
      if (similarity > 0.7) {
        similarities.push({
          file,
          chunk: chunk.chunk,
          similarity,
          text: chunk.text.slice(0, 1000),
        })
      }
    }
  }

  similarities.sort((a, b) => b.similarity - a.similarity)

  let totalLength = 0
  const maxContextLength = 4000

  for (let i = 0; i < Math.min(topN, similarities.length); i++) {
    const { file, text } = similarities[i]
    if (totalLength + text.length > maxContextLength) {
      break
    }
    context += `${file}:\n\n${text}\n\n`
    totalLength += text.length
  }

  return context
}

async function generateAnswer(question, context) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a Lido documentation expert and technical advisor. You provide clear, confident answers about Lido's technology, infrastructure, and development practices.

    Guidelines for your responses:
    - Answer directly and confidently as a Lido expert
    - If the exact information isn't available, focus on the most relevant related information you have
    - Be concise and specific
    - Focus on technical accuracy and practical implementation details
    - When discussing technical topics:
      * Start with the most relevant information first
      * Explain how different components interact
      * Include specific technical details and configurations
      * Highlight security considerations and best practices
    - Use markdown formatting for code blocks and commands
    - Structure answers with clear sections using headers
    - Don't use phrases like:
      * "In the context provided"
      * "Based on the provided context"
      * "There is no direct information"
      * "It seems that"
      * "Could potentially"
    - Make definitive statements about what you know
    - If information is limited, focus on explaining what IS known rather than what isn't
    - Always connect your answer to Lido's infrastructure and practices
    - When answering questions about specific topics:
      * First describe what's directly documented about the topic
      * Include relevant technical specifications from docs
      * Explain documented interactions with other Lido components
      * Only mention related features if they're explicitly connected in docs
    - For questions about tools and systems:
      * Focus on documented functionality and requirements
      * Include specific configuration details from docs
      * Describe documented integration points
    - Keep answers grounded in Lido's documented practices and implementations`,
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuestion: ${question}\n\nProvide a clear and specific answer based only on the context provided.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error('Error generating answer:', error)
    throw new Error('Failed to generate answer')
  }
}

app.post('/answer-question', async (req, res) => {
  const { question } = req.body
  if (!question) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const documents = await loadDocuments()
    const context = await getDocumentContext(documents, question)
    const answer = await generateAnswer(question, context)

    marked.setOptions({
      gfm: true,
      breaks: true,
      highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value
        }
        return code
      },
    })

    const formattedAnswer = {
      markdown: answer,
      html: marked(answer),
      sources: context
        ? context.split('\n\n').reduce((acc, block) => {
            const [path] = block.split(':')
            if (path && path.endsWith('.md')) {
              const cleanPath = '/' + path.replace(/^docs\//, '').replace(/\.md$/, '')
              acc.push({
                title: cleanPath.split('/').pop(),
                path: cleanPath,
              })
            }
            return acc
          }, [])
        : [],
    }

    res.json(formattedAnswer)
  } catch (error) {
    console.error('Error processing request:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
