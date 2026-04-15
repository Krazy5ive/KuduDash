import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'build')))

app.get('/{*splat}', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(PORT, () => {
	console.log(`Server listening on:\n${PORT}`)
})