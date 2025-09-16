import { Routes, Route } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { Grievances } from "@/pages/dashboard";
import { SignalIcon } from "@heroicons/react/24/outline";
import loader from "./loader.svg"
import { ToastContainer } from "react-toastify";
import { Loader } from "@/pages/dashboard/CategoricalTree";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, openSidenav, loading } = controller;

  return (
    <div className="min-h-screen bg-blue-gray-50/50" >
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }

      />
      <div className={`p-4 transition-all duration-300 ${openSidenav ? "xl:ml-80 xl:pl-1" : "xl:ml-[5rem] xl:pl-1"}`} >
        <DashboardNavbar />

        <Configurator />

        {/* <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10 border-2 bg-blue-600 select-none"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-white" title="Search in Grievances" />
        </IconButton> */}

        {
          loading &&
          <div className="fixed h-[100vh] w-[100vw] flex justify-center items-center z-[2000] bg-blur top-0 left-0 select-none">
            <Loader className="animate-spin" height="40px" />
          </div>
        }

        <Routes >
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>

        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "grievances" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>

        <ToastContainer />
      </div>
    </div >
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
