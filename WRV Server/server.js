const http = require('http')
const url = require('url')
const qs = require('querystring')

const database = require('./database-utils')

const DEFAULT_HOST_NAME = 'http://localhost:8080'

// create server
const server = http.createServer((req, res) => {
   res.setHeader("Access-Control-Allow-Origin", DEFAULT_HOST_NAME)
   res.setHeader("Access-Control-Allow-Credentials", "true")
   res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
   res.setHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
})

// listen client request
server.on('request', (req, res) => {
   let urlObject = url.parse(req.url, true)
   let pathname = urlObject.pathname

   // deal with get
   if (pathname == "/fileList" || pathname == "/") {
      database.getAllfiles(function (data) {
         res.end(data)
      })
   } else if (pathname == "/delete") {
      let index = urlObject.query.index
      database.deletefile(index, function (data) {
         res.end(data)
      })
   } else if (pathname == "/getdata") {
      let index = urlObject.query.index
      database.getFileContent(index, function (data) {
         res.end(data)
      })
   }

   // deal with post
   let post = ''
   req.on('data', chunk => {
      post += chunk
   })

   req.on('end', function () {
      post = qs.parse(post)
      for (let element in post) {
         if (req.url == "/upload") {
            let dataJson = JSON.parse(element)
            database.uploadFiles(dataJson, function (data) {
               res.end(data)
            })
         } else if (req.url == "modify") {
            // todo modify function
         }
      }
   })
})

// server on connect
server.on('connect', req => {
   const {
      port,
      hostname
   } = new URL(`http://${req.url}`)

   console.log(`${hostname}:${port} is connect.`)
})

// server listen on 9090
server.listen(9090, '127.0.0.1', () => {
   console.log('Server start on http://localhost:9090.')
})