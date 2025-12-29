import LoginForm from "@/compenets/loginForm/LoginForm";
import ThemeControler from "@/compenets/ThemeController/ThemeControler";
import Image from "next/image";

export default function Home() {
  return (
    <div className=" text-primary  overflow-hidden">
      <div className="w-full flex justify-between items-center max-w-11/12 mx-auto my-5 gap-2">
        <div>
          <h2 className="text-2xl font-bold text-base-content max-sm:text-md">Project<span className="text-blue-400">Pulse</span></h2>
        </div>
        <div className="flex items-center gap-4 ">
          <h2 className="text-2xl max-sm:text-sm text-base-content font-bold">Theme: </h2>
          <ThemeControler/>
        </div>
      </div>
      <div className="max-h-[calc(100vh-80px)]">
          <LoginForm/>
      </div>
    </div>
  );
}
