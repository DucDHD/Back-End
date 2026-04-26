/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from '~/config/cors'


const START_SERVER = () => {

  const app = express()

  // use cors
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs V1
  app.use('/v1', APIs_V1)

  // middleware centralized error handling
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`3. Production:  I am ${env.AUTHOR} Back-end Server is running success at ${ process.env.PORT }/`)
    })
  } else {
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(`3. Local Dev: I am ${env.AUTHOR} Back-end Server is running success at http://${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }


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