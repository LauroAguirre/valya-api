import axios, { AxiosInstance } from 'axios'

export const AsaasApi = (): AxiosInstance => {
  const api = axios.create({
    baseURL: process.env.ASAAS_API,
    headers: {
      access_token: process.env.ASAAS_KEY
    }
  })

  return api
}
