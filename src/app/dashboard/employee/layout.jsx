import ThemeControler from "@/compenets/ThemeController/ThemeControler";
import { cookies } from "next/headers";
import { verify } from "../../api/auth/verify";
import { FaChartPie, FaUsers, FaUserTie } from "react-icons/fa6";
import { AiFillProject } from "react-icons/ai";
import Link from "next/link";
import Logout from "@/compenets/Logout/Logout";
import { FaHistory, FaTasks } from "react-icons/fa";
const EmployeeLayout = async ({ children }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const userRole = await verify(token);

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <nav className="navbar w-full bg-base-300">
            
            <div className="px-4 flex justify-between items-center w-full">
              <div className="flex justify-center items-center gap-4">
                <h2 className="text-2xl font-bold text-base-content max-sm:text-md">
                  Project<span className="text-blue-400">Pulse</span>
                </h2>
                <h2 className="font-bold border-l-2 border-primary pl-4">
                  {" "}
                  {userRole} Dashboard
                </h2>
              </div>
              <div className="flex gap-2 items-center">
                <ThemeControler />
                <Logout />
              </div>
            </div>
          </nav>
          {/* Page content here */}
          <div>{children}</div>
        </div>

       
      </div>
    </>
  );
};

export default EmployeeLayout;
