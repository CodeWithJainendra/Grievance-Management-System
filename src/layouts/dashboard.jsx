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
import { useMaterialTailwindController, setOpenConfigurator, setOpenSidenav, useTheme } from "@/context";
import { Grievances } from "@/pages/dashboard";
import { SignalIcon } from "@heroicons/react/24/outline";
import loader from "./loader.svg"
import { ToastContainer } from "react-toastify";
import { Loader } from "@/pages/dashboard/CategoricalTree";
import { useEffect, useRef, useState } from "react";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { isDark } = useTheme();
  const { sidenavType, openSidenav, collapsedSidenav, loading } = controller;
  const mainContentRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsive width calculations
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle on mobile/tablet (below xl breakpoint)
      if (windowWidth < 1280 && openSidenav) {
        const sidebar = document.querySelector('aside');
        if (sidebar && !sidebar.contains(event.target)) {
          setOpenSidenav(dispatch, false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSidenav, dispatch, windowWidth]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark:bg-dark-bg bg-gray-900' : 'bg-blue-gray-50/50'}`}>
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      
      {/* Main Content Area with Enhanced Spacing */}
      <div
        ref={mainContentRef}
        className={`transition-all duration-300 min-h-screen ${
          openSidenav
            ? collapsedSidenav
              ? "ml-0 lg:ml-24" // 96px = collapsed sidebar(80px) + small gap(16px)
              : "ml-0 lg:ml-80" // 320px = expanded sidebar(288px) + gap(32px)
            : "ml-0"  // No margin when sidebar is completely hidden
        }`}
        style={{
          width: windowWidth >= 1280 && openSidenav 
            ? collapsedSidenav 
              ? 'calc(100vw - 96px)' // Full width minus collapsed sidebar space on desktop
              : 'auto' // Auto width for expanded state to prevent gaps
            : '100vw' // Full viewport width on mobile or when sidebar is hidden
        }}
      >
        {/* Content Wrapper with Responsive Padding */}
         <div className={`transition-all duration-300 relative z-10 ${
           collapsedSidenav ? 'mx-auto p-3 sm:p-4 max-w-full' : 'p-4 sm:p-6 w-full'
         }`}>
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
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
