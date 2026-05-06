import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/brevoProvider'

const createNew = async (reqBody) => {
  try {
    // check exists user
    const existsUser = await userModel.findOneByEmail(reqBody.email)
    if (existsUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    // Create Data
    // nameFromEmail: examle1@gmail.com => "examle1"
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email:reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // Save to Data
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // send email
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Please verify your email before using our services'
    const htmlContent = `
      <h3> here is your verification link:  </h3>
      <h3> ${verificationLink} </h3>
      <h3> Sincerely, </br> - DucDH</h3>
    `

    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    return pickUser(getNewUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew
}