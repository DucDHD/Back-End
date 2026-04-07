/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes'

const createNew = (req, res, next) => {
  try {
    console.log(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'POST from Controller : APIs create new board' })
  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}