import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import config from '../config'

export const useSignup = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { dispatch } = useAuthContext()

  const signup = async (email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${config.API_URL}/api/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : null

      if (!response.ok) {
        setError(data?.error || 'Signup failed')
        setIsLoading(false)
        return
      }

      // success
      localStorage.setItem('user', JSON.stringify(data))
      dispatch({ type: 'LOGIN', payload: data })
      setIsLoading(false)

    } catch (err) {
      setError('Network error')
      setIsLoading(false)
    }
  }

  return { signup, isLoading, error }
}
