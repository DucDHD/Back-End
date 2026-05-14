import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

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

const verifyAccount = async (reqBody) => {
  try {
    const existsUser = await userModel.findOneByEmail(reqBody.email)
    if (!existsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not Found!')
    if (existsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your account is already active!')
    if (reqBody.token !== existsUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid')

    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(existsUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    const existsUser = await userModel.findOneByEmail(reqBody.email)

    if (!existsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not Found!')
    if (!existsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your account not active!')

    if (!bcryptjs.compareSync(reqBody.password, existsUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your email or password is incorrect!')
    }

    const userInfo = { _id: existsUser._id, email: existsUser.email }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      //5
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      //15
    )

    return { accessToken, refreshToken, ...pickUser(existsUser) }

  } catch (error) { throw error }
}

const refreshToken = async(clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      //5
    )
    return { accessToken }
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken
}