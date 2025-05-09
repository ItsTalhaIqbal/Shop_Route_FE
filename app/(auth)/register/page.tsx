import RegisterForm from '@/components/forms/RegisterForm'
import React from 'react'

type Props = {}

const Register = (props: Props) => {
  return (
    <div className='bg-black'>
    <div className='flex items-center justify-center min-h-screen w-full border'>

      <RegisterForm/>
    </div>
  </div>
  )
}

export default Register