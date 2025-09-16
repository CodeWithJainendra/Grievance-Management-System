import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowPathRoundedSquareIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  ArrowLeftOnRectangleIcon,

} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { UserContext, logout, getUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";


export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const navigate = useNavigate();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  // const [userData, setUser] = useContext(UserContext);
  // const user = JSON.parse(userData)
  const user = getUser()

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
        : "pl-2 pr-0 py-1"
        }`}
      fullWidth
      blurred={fixedNavbar}

    >
      <div className="flex justify-between gap-6 flex-row md:items-center">
        <div className="flex gap-3 items-center">
          <Bars3Icon className="text-black h-6 w-6 cursor-pointer" onClick={() => setOpenSidenav(dispatch, !openSidenav)} title={!openSidenav ? 'Open Navigation Menu' : 'Close Navigation Menu'} />

          <div className="capitalize">
            <Typography variant="h6" color="blue-gray">
              {page.replace(/-/g, ' ')}
            </Typography>
          </div>
        </div>
        <div className="flex items-center">

          <Button
            variant="text"
            color="blue-gray"
            className="items-center gap-1 px-4 hidden sm:flex"
            onClick={logout}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-blue-gray-500" />
            Logout
          </Button>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
            title="Search in Grievances"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
          </IconButton>
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray" title="Profile">
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0" >
              <MenuItem className="flex items-center gap-3" >
                <UserCircleIcon className="h-8 w-8 text-blue-gray-500" />

                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>Hello</strong> {user?.username}
                  </Typography>
                </div>
              </MenuItem>

              <MenuItem className="flex items-center gap-4">
                <Link to="/dashboard/read">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>Read Grievances</strong>
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className="flex items-center gap-4">
                <Link to="/dashboard/saved-grievances">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>Saved Grievances</strong>
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className="flex items-center gap-4">
                <Link to="/dashboard/search-history">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>Search History</strong>
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className="flex items-center gap-4" >
                <Link to="/change-password" >
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1 font-normal"
                    >
                      <strong>Change Password</strong>
                    </Typography>
                  </div>
                </Link>
              </MenuItem>

              <MenuItem className="flex justify-between center items-center gap-4">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-1 font-normal"
                  onClick={logout}
                >
                  <strong>Log Out</strong>
                </Typography>

                <ArrowLeftOnRectangleIcon width={22} className="mb-1 text-blue-gray-900" />
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
