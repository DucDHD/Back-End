import { env } from '~/config/environment'
const SibApiV3Sdk = require('@getbrevo/brevo')

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (toEmail, customSubject, htmlContent) => {
  console.log('Vào sendEmail')
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
  console.log('Vào sendSmtpEmail')

  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }
  sendSmtpEmail.to = [{ email: toEmail }]
  sendSmtpEmail.subject = customSubject
  sendSmtpEmail.htmlContent = htmlContent
  console.log('apiInstance.sendTransacEmail')


  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}