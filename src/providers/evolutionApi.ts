import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const EVOLUTION_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_TOKEN = process.env.EVOLUTION_API_TOKEN

export const evolutionApi = axios.create({
  baseURL: EVOLUTION_URL,
  headers: {
    apikey: `${EVOLUTION_TOKEN}`,
    'Content-Type': 'application/json'
  }
})
