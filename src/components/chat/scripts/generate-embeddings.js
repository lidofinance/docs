const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')
require('dotenv').config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Reduce maximum chunk size to leave a good buffer until the 8192 limit
const MAX_CHUNK_SIZE = 4000

function splitIntoChunks(text) {
  const chunks = []
  const paragraphs = text.split('\n\n')
  let currentChunk = ''
  let currentTokenCount = 0

  for (const paragraph of paragraphs) {
    // Rough token count estimate (4 characters ~ 1 token)
    const paragraphTokens = paragraph.length / 4

    if (currentTokenCount + paragraphTokens > MAX_CHUNK_SIZE && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = paragraph
      currentTokenCount = paragraphTokens
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph
      currentTokenCount += paragraphTokens
    }

    // If a single paragraph is larger than the maximum size, split it by sentences
    if (paragraphTokens > MAX_CHUNK_SIZE) {
      const sentences = paragraph.split(/(?<=[.!?])\s+/)
      currentChunk = ''
      currentTokenCount = 0

      for (const sentence of sentences) {
        const sentenceTokens = sentence.length / 4
        if (currentTokenCount + sentenceTokens > MAX_CHUNK_SIZE) {
          if (currentChunk) {
            chunks.push(currentChunk.trim())
          }
          currentChunk = sentence
          currentTokenCount = sentenceTokens
        } else {
          currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence
          currentTokenCount += sentenceTokens
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

async function generateEmbeddings() {
  const docsDir = path.join(__dirname, '../../../../docs')
  const documents = {}

  function readDocs(dir) {
    const files = fs.readdirSync(dir)
    files.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        readDocs(filePath)
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const relativePath = path.relative(docsDir, filePath)
        documents[relativePath] = fs.readFileSync(filePath, 'utf8')
      }
    })
  }

  readDocs(docsDir)

  const embeddings = {}
  for (const [file, content] of Object.entries(documents)) {
    try {
      console.log(`Processing ${file}...`)
      const chunks = splitIntoChunks(content)
      console.log(`Split into ${chunks.length} chunks`)

      embeddings[file] = []

      for (let i = 0; i < chunks.length; i++) {
        try {
          console.log(`Generating embedding for ${file} chunk ${i + 1}/${chunks.length}`)
          const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: chunks[i],
          })
          embeddings[file].push({
            chunk: i,
            embedding: response.data[0].embedding,
            text: chunks[i],
          })
          // Add a small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 200))
        } catch (error) {
          console.error(`Error generating embedding for ${file} chunk ${i + 1}:`, error)
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error)
    }
  }

  const embeddingsPath = path.join(__dirname, '../server/embeddings.json')
  fs.writeFileSync(embeddingsPath, JSON.stringify(embeddings, null, 2))
  console.log(`Embeddings saved to ${embeddingsPath}`)
}

generateEmbeddings().catch(console.error)
