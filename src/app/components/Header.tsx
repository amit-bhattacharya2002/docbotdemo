"use server"
import Link from 'next/link'
import React from 'react'


type Props = {}

const Header = (props: Props) => {
  return (
    <div className='w-full h-[10vh] border  flex items-center justify-between px-10'>
        <Link href="/" className='w-fit'>
            <h1>DocuBot</h1>
        </Link>
        <nav className='w-[50%] h-auto gap-10 flex items-center justify-between'>

            <Link href="/" className='w-fit'>DocuBot Admin</Link>
        </nav>
    </div>
  )
}

export default Header