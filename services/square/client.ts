import { Client, Environment } from 'square'

const { SQUARE_ACCESS_TOKEN } = process.env

export const client = new Client({
  environment:
    process.env.SQUARE_ENV === 'production'
      ? Environment.Production
      : Environment.Sandbox,
  accessToken: SQUARE_ACCESS_TOKEN,
})
