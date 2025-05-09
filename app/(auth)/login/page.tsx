
import LoginForm from '@/components/forms/LoginForm'
import React from 'react'

type Props = {}

const Login = (props: Props) => {
  return (
    <div className='bg-black'>
      <div className='flex items-center justify-center min-h-screen w-full border'>

        <LoginForm/>
      </div>
    </div>
  )
}

export default Login