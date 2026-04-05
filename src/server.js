import express from 'express'
import exitHook from 'async-exit-hook'

import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'

const START_SERVER = () => {

  const app = express()

  const hostname = 'localhost'
  const port = 8017

  app.get('/', async (req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`3. Back-end Server is running success at http://${ hostname }:${ port }/`)
  })

  exitHook(async () => {
    console.log('4. Disconnecting to MongoDB Clout Atlas')
    await CLOSE_DB()
    console.log('5. Disconnected to MongoDB Clout Atlas')
  })

}

( async () => {
  try {
    console.log('1. Connecting to MongoDB Clout Atla...')
    CONNECT_DB()
    console.log('2. Connected to MongoDB Clout Atlas')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// console.log('1. connecting to MongoDB Clout Atla...')
// CONNECT_DB()
//   .then(() => console.log('2. connected to MongoDB Clout Atlas') )
//   .then(() => START_SERVER() )
//   .catch( error => {
//     console.error(error)
//     process.exit(0)
//   })