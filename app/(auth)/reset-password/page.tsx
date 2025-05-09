
import ResetPasswordForm from '@/components/forms/ResetPassword'
import React from 'react'

type Props = {}

const Login = (props: Props) => {
  return (
    <div className='bg-black'>
      <div className='flex items-center justify-center min-h-screen w-full border'>

        <ResetPasswordForm/>
      </div>
    </div>
  )
}

export default Login