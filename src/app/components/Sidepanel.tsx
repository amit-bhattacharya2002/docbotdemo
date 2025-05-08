'use client';

import UploadDocument from "./UploadDocument";
import Link from "next/link";

export const Sidepanel = () => {
    return (
        <div className="w-[20vw] sticky top-0  h-screen border-r-1 border-green-900  p-4 pb-10 flex flex-col items-center gap-5 text-white bg-green-900 overflow-x-hidden" >
            <Link href="/">
                <h1 className="text-4xl text-center w-fit mx-auto py-10">DocBot</h1>
            </Link>
            {/* <h1>Welcome: {session?.user?.name}</h1>
             */}
            {/* <SignInSignOut />

            <Link href="/userinfo" className="border bg-black border-black text-md rounded w-full p-4">
                Manage Account
            </Link> */}
            <UploadDocument />
        </div>
    )
}
