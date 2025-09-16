import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import logo from './logo.png'
import darpg_logo from './darpg-emblem-logo-1.png'
import { useFilter } from "@/context/FilterContext";


export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const { setToDefault } = useFilter()
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-blue-gray-800 to-blue-gray-900",
    white: "bg-white shadow-lg",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`
        ${sidenavTypes[sidenavType]}
        ${openSidenav ? "w-72 translate-x-0" : "w-[5rem] -translate-x-full xl:translate-x-0"}
        fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] rounded-xl transition-all duration-300 z-[1100]
        ${!openSidenav ? "xl:hover:w-72" : ""} group overflow-y-auto
      `}
    >
      <div
        className={`relative border-b ${sidenavType === "dark" ? "border-white/20" : "border-blue-gray-50"
          }`}
      >
        <div className={"flex items-center bg-white gap-4 relative rounded-t-md"}>
          <Link to="/" className="flex items-center justify-center w-full">
            <img 
              src={logo} 
              className={`${openSidenav ? 'block' : 'hidden group-hover:block'} py-4 px-8 transition-all duration-300`} 
            />
            <img 
              src={darpg_logo} 
              className={`${openSidenav ? 'hidden' : 'block group-hover:hidden'} p-3 transition-all duration-300`} 
            />
          </Link>

          <div className={`absolute -right-10 bg-white p-2 rounded-r-full xl:hidden ${openSidenav ? "block" : "hidden"}`}>
            <XMarkIcon className="text-black h-6 w-6 cursor-pointer" onClick={() => setOpenSidenav(dispatch, false)} />
          </div>
        </div>
      </div>
      <div className="m-4" >
        <ul className="mb-4 flex flex-col gap-1" >
          {routes[0].title && (
            <li className="mx-3.5 mt-4 mb-2"  >
              <Typography
                variant="small"
                color={sidenavType === "dark" ? "white" : "blue-gray"}
                className="font-black uppercase opacity-75"
              >
                {routes[0].title}
              </Typography>
            </li>
          )}
          {
            routes[0].pages.map(({ icon, name, path }, key) => (
              <li key={key}>
                <NavLink to={`/${routes[0].layout}${path}`} onClick={setToDefault}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                      }
                      className={"px-3 capitalize"}
                      fullWidth
                    >
                      <div className={`flex ${openSidenav ? "gap-4 items-center" : "justify-center"} ${!openSidenav ? "group-hover:gap-4 group-hover:items-center group-hover:justify-start" : ""} transition-all duration-300`} title={!openSidenav ? name : ""}>
                        <div className="flex-shrink-0">
                          {icon}
                        </div>
                        <div
                          color="inherit"
                          className="font-medium capitalize overflow-hidden"
                        >
                          <div className={`${openSidenav ? 'block' : 'hidden group-hover:block'} transition-all duration-300 whitespace-nowrap`}>
                            {name}
                          </div>
                        </div>
                      </div>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
        </ul>
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Material Tailwind React",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
