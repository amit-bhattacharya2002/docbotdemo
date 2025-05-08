import Image from "next/image";
import { Sidepanel } from "./components/Sidepanel";
import SearchUI from "./components/SearchUI";
import { NoAccountPrompt } from "./components/NoAccountPrompt";

export default function Home() {
  return (
    <div className=" h-[90vh] w-full flex flex-row">
        {/* <h1>Welcome {session.user.name}</h1> */}
        {/* <Link href="/userinfo">User Info</Link> */}
        {/* <SignOutButton /> */}
        {/* <Sidepanel />
        <SearchUI /> */}
        <NoAccountPrompt />
        {/* <UploadDocument/> */}
      </div>
  );
}
