import React from "react";
import PropTypes from "prop-types";

export const MaterialTailwind = React.createContext(null);
MaterialTailwind.displayName = "MaterialTailwindContext";

// Export theme context
export { ThemeProvider, useTheme } from "./ThemeContext";

export function reducer(state, action) {
  switch (action.type) {
    case "OPEN_SIDENAV": {
      return { ...state, openSidenav: action.value };
    }
    case "COLLAPSE_SIDENAV": {
      return { ...state, collapsedSidenav: action.value };
    }
    case "SIDENAV_TYPE": {
      return { ...state, sidenavType: action.value };
    }
    case "SIDENAV_COLOR": {
      return { ...state, sidenavColor: action.value };
    }
    case "TRANSPARENT_NAVBAR": {
      return { ...state, transparentNavbar: action.value };
    }
    case "FIXED_NAVBAR": {
      return { ...state, fixedNavbar: action.value };
    }
    case "OPEN_CONFIGURATOR": {
      return { ...state, openConfigurator: action.value };
    }
    case "LOADER": {
      return { ...state, loading: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export function MaterialTailwindControllerProvider({ children }) {
  const initialState = {
    openSidenav: true, // Always visible
    collapsedSidenav: window.innerWidth < 1280, // Collapsed on mobile, expanded on desktop
    sidenavColor: "blue",
    sidenavType: "dark",
    transparentNavbar: true,
    fixedNavbar: false,
    openConfigurator: false,
    loading: false
  };

  const [controller, dispatch] = React.useReducer(reducer, initialState);
  
  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1280;
      
      if (isMobile) {
        // On mobile: hide sidebar by default, reset collapsed state
        dispatch({ type: "OPEN_SIDENAV", value: false });
        dispatch({ type: "COLLAPSE_SIDENAV", value: false });
      } else {
        // On desktop: show sidebar, keep current collapsed state
        dispatch({ type: "OPEN_SIDENAV", value: true });
        // Don't reset collapsed state on desktop to maintain user preference
      }
    };

    // Set initial state only once
    const isMobile = window.innerWidth < 1280;
    if (isMobile) {
      dispatch({ type: "OPEN_SIDENAV", value: false });
      dispatch({ type: "COLLAPSE_SIDENAV", value: false });
    } else {
      dispatch({ type: "OPEN_SIDENAV", value: true });
    }
    
    // Add event listener for future resize events
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const value = React.useMemo(
    () => [controller, dispatch],
    [controller, dispatch]
  );

  return (
    <MaterialTailwind.Provider value={value}>
      {children}
    </MaterialTailwind.Provider>
  );
}

export function useMaterialTailwindController() {
  const context = React.useContext(MaterialTailwind);

  if (!context) {
    throw new Error(
      "useMaterialTailwindController should be used inside the MaterialTailwindControllerProvider."
    );
  }

  return context;
}

MaterialTailwindControllerProvider.displayName = "/src/context/index.jsx";

MaterialTailwindControllerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const setOpenSidenav = (dispatch, value) =>
  dispatch({ type: "OPEN_SIDENAV", value });
export const setCollapsedSidenav = (dispatch, value) =>
  dispatch({ type: "COLLAPSE_SIDENAV", value });
export const setSidenavType = (dispatch, value) =>
  dispatch({ type: "SIDENAV_TYPE", value });
export const setSidenavColor = (dispatch, value) =>
  dispatch({ type: "SIDENAV_COLOR", value });
export const setTransparentNavbar = (dispatch, value) =>
  dispatch({ type: "TRANSPARENT_NAVBAR", value });
export const setFixedNavbar = (dispatch, value) =>
  dispatch({ type: "FIXED_NAVBAR", value });
export const setOpenConfigurator = (dispatch, value) =>
  dispatch({ type: "OPEN_CONFIGURATOR", value });
export const setLoading = (dispatch, value) =>
  dispatch({ type: "LOADER", value });

export const startLoading = (dispatch) => setLoading(dispatch, true)
export const stopLoading = (dispatch) => setLoading(dispatch, false)
