import React from 'react'
import Image from 'next/image'
import Docbot from './components/Docbot'
import RestofPage from './components/RestofPage'

type Props = {}

const page = (props: Props) => {
  return (
    <div className=' w-full min-h-screen'>
        <Image 
          src={'/sfubg.png'} 
          alt='sfu-logo' 
          fill
          className=' '
          priority
        />

          <RestofPage />

        <Docbot />
    </div>
  )
}

export default page