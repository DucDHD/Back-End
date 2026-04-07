import { StatusCodes } from 'http-status-codes'

const createNew = (req, res, next) => {
  try {
    console.log(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'POST from Controller : APIs create new board' })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message
    })
  }
}

export const boardController = {
  createNew
}