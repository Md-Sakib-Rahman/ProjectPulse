import ThemeControler from "@/compenets/ThemeController/ThemeControler";
import { cookies } from "next/headers";
import { verify } from "../../api/auth/verify";
import { FaChartPie, FaUsers, FaUserTie } from "react-icons/fa6";
import { AiFillProject } from "react-icons/ai";
import Link from "next/link";
import Logout from "@/compenets/Logout/Logout";
const layout = async ({ children }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const userRole = await verify(token);
  
  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <nav className="navbar w-full bg-base-300">
            <label
              htmlFor="my-drawer-4"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="my-1.5 inline-block size-4"
              >
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
              </svg>
            </label>
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
                <Logout/>
              </div>
            </div>
          </nav>
          {/* Page content here */}
          <div>{children}</div>
        </div>

        <div className="drawer-side is-drawer-close:overflow-visible">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
            {/* Sidebar content here */}
            <ul className="menu w-full grow">
              {/* List item */}
              <li>
                <Link
                  href={"/dashboard/admin"}
                  className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                  data-tip="Homepage"
                >
                  {/* Home icon */}
                  <AiFillProject size={22} />
                  <span className="is-drawer-close:hidden">
                    On-going Projects
                  </span>
                </Link>
              </li>

              {/* List item */}
              <li>
                <Link
                  href={"/dashboard/admin/user-list"}
                  className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                  data-tip="User-List"
                >
                  {/* Settings icon */}
                  <FaUsers size={22} />
                  <span className="is-drawer-close:hidden">User Lists</span>
                </Link>
              </li>

             
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default layout;
