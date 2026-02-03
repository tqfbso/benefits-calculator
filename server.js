const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3002
const DIST = path.join(__dirname, 'dist')

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
}

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url
  filePath = path.join(DIST, filePath)
  
  const ext = path.extname(filePath)
  const contentType = mimeTypes[ext] || 'application/octet-stream'
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    }
  })
})

server.listen(PORT, () => {
  console.log(`Benefits Calculator running at http://localhost:${PORT}`)
  console.log(`Or via Tailscale: http://100.120.85.54:${PORT}`)
})
