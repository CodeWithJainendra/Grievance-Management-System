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
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Card,
  CardBody,
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
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
  setCollapsedSidenav,
  useTheme,
} from "@/context";
import { UserContext, logout, getUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { getHighAlerts } from "@/services/notifications";
import NotificationBadge from "@/widgets/component/NotificationBadge";
import { formatDate, dateBefore } from "@/helpers/date";


export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { fixedNavbar, openSidenav, collapsedSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);
  
  const [highAlerts, setHighAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [totalAlertsCount, setTotalAlertsCount] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  // Fixed date range for notifications (January 1st to present)
  const startDateDisplay = '2025-01-01';
  const endDateDisplay = formatDate();
  
  // const [userData, setUser] = useContext(UserContext);
  // const user = JSON.parse(userData)
  const user = getUser()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch high priority alerts
  useEffect(() => {
    fetchHighAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchHighAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchHighAlerts = async () => {
    setAlertsLoading(true);
    try {
      console.log('🔍 Fetching high priority alerts...');
      const response = await getHighAlerts();
      console.log('📊 Notification API Response:', response);
      
      if (response?.success && response?.data && Array.isArray(response.data)) {
        // Use real data if API succeeds
        setHighAlerts(response.data);
        setTotalAlertsCount(response.count || response.data.length);
        console.log(`✅ Loaded ${response.data.length} high priority alerts`);
      } else {
        // API returned but no data or unsuccessful
        console.log('⚠️ API returned no data or unsuccessful response');
        setHighAlerts([]);
        setTotalAlertsCount(0);
      }
    } catch (error) {
      console.error("❌ Error fetching high alerts:", error);
      setHighAlerts([]);
      setTotalAlertsCount(0);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleAlertClick = (alert) => {
    // Create detailed demo data for the selected alert
    const detailedAlert = {
      ...alert,
      // Add demo detailed information
      registration_no: alert.registration_no || `REG/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      complainant_name: alert.complainant_name || 'Rajesh Kumar Singh',
      complainant_email: alert.complainant_email || 'rajesh.kumar@email.com',
      complainant_phone: alert.complainant_phone || '+91 9876543210',
      detailed_description: alert.detailed_description || `This is a detailed description of the grievance regarding ${alert.subject || 'service delivery issues'}. The complainant has reported multiple instances of delays and inadequate response from the concerned department. Immediate attention and resolution is required to address this high-priority matter.`,
      current_status: alert.current_status || 'Under Review',
      assigned_officer: alert.assigned_officer || 'Dr. Priya Sharma, Joint Secretary',
      department: alert.department || alert.ministry || 'Department of Administrative Reforms',
      escalation_level: alert.escalation_level || 'Level 2 - Ministry Level',
      expected_resolution: alert.expected_resolution || '7 working days',
      last_action_date: alert.last_action_date || new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      last_action: alert.last_action || 'Case forwarded to concerned department for immediate action',
      attachments: alert.attachments || ['Document_1.pdf', 'Evidence_Photo.jpg'],
      priority_reason: alert.priority_reason || 'Multiple escalations and media attention',
      citizen_feedback: alert.citizen_feedback || 'Citizen expressed dissatisfaction with current progress',
    };
    
    setSelectedAlert(detailedAlert);
    setShowAlertModal(true);
  };

  return (
    <>
    <Navbar
      color={fixedNavbar ? (isDark ? "gray" : "white") : "transparent"}
      className={`rounded-xl transition-all duration-300 ${
        isDark 
          ? 'dark:bg-dark-surface bg-gray-800 dark:text-dark-text text-white' 
          : ''
      } ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
        : "pl-2 pr-0 py-1"
        }`}
      fullWidth
      blurred={fixedNavbar}

    >
      <div className="flex justify-between gap-6 flex-row md:items-center">
        <div className="flex gap-3 items-center">
          <IconButton
            variant="text"
            size="sm"
            className={`transition-all duration-200 hover:bg-opacity-20 ${
              isDark ? 'text-white hover:bg-white' : 'text-gray-700 hover:bg-gray-700'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // On mobile, toggle sidebar visibility
              if (isMobile) {
                setOpenSidenav(dispatch, !openSidenav);
              } else {
                // On desktop, toggle between collapsed and expanded
                setCollapsedSidenav(dispatch, !collapsedSidenav);
              }
            }}
            title={isMobile 
              ? (!openSidenav ? 'Show Navigation Panel' : 'Hide Navigation Panel')
              : (collapsedSidenav ? 'Expand Navigation Panel' : 'Collapse Navigation Panel')
            }
          >
            <Bars3Icon className="h-6 w-6" />
          </IconButton>

          <div className="capitalize">
            <Typography 
              variant="h6" 
              color={isDark ? "white" : "blue-gray"}
              className="transition-colors"
            >
              {page.replace(/-/g, ' ')}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Enhanced Theme Toggle */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <SunIcon className={`h-4 w-4 transition-colors ${
              !isDark ? 'text-yellow-600' : 'text-gray-400'
            }`} />
            <div
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-12 cursor-pointer rounded-full transition-colors duration-300 focus:outline-none ${
                isDark ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isDark ? 'translate-x-7' : 'translate-x-1'
                }`}
                style={{ marginTop: '4px' }}
              />
            </div>
            <MoonIcon className={`h-4 w-4 transition-colors ${
              isDark ? 'text-blue-400' : 'text-gray-400'
            }`} />
          </div>

          {/* Notifications Bell */}
          <Menu>
            <MenuHandler>
              <div className="relative">
                <IconButton
                  variant="text"
                  color="blue-gray"
                  title="High Priority Alerts"
                  className={`${isDark ? 'text-white' : 'text-gray-700'}`}
                >
                  <BellIcon className="h-5 w-5" />
                </IconButton>
                {totalAlertsCount > 0 && (
                  <NotificationBadge
                    count={totalAlertsCount > 99 ? 99 : totalAlertsCount}
                    className="z-50"
                  />
                )}
              </div>
            </MenuHandler>
            <MenuList className={`w-80 max-h-96 overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  High Priority Alerts
                </Typography>
                <Typography variant="small" color="gray" className="mt-1">
                  Showing alerts from January 1, 2025 to {endDateDisplay} ({totalAlertsCount} total)
                </Typography>
              </div>
              
              {alertsLoading ? (
                <div className="p-4 text-center">
                  <Typography color={isDark ? "white" : "blue-gray"}>Loading alerts...</Typography>
                </div>
              ) : highAlerts.length > 0 ? (
                highAlerts.map((alert, idx) => (
                  <MenuItem 
                    key={alert.registration_no || idx} 
                    className={`p-3 cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-gray-800 dark:text-white text-sm">
                          {alert.state || alert.district || 'Unknown Location'}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {new Date(alert.recvd_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-200">
                        {alert.subject?.length > 60 ? `${alert.subject.substring(0, 60)}...` : alert.subject}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                        <span>{alert.ministry || 'Unknown Ministry'}</span>
                        <span className="font-medium text-red-600">{alert.priority || 'High'}</span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Click to view details →
                      </div>
                    </div>
                  </MenuItem>
                ))
              ) : (
                <div className="p-4 text-center py-8">
                  <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Typography color={isDark ? "white" : "blue-gray"} className="mb-1">
                    No high priority alerts
                  </Typography>
                  <Typography variant="small" color="gray">
                    All systems operational
                  </Typography>
                </div>
              )}
            </MenuList>
          </Menu>

          {/* Search Icon */}
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
            title="Search in Grievances"
            className={`${isDark ? 'text-white' : 'text-gray-700'}`}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </IconButton>

          {/* Enhanced Profile Menu */}
          <Menu>
            <MenuHandler>
              <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Avatar
                  variant="circular"
                  size="sm"
                  alt={user?.username || "User"}
                  className="border border-gray-300 dark:border-gray-600"
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
                />
                <div className="hidden md:block text-left">
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    {user?.username || "User"}
                  </Typography>
                  <Typography variant="small" color="gray" className="text-xs">
                    {user?.role || "Admin"}
                  </Typography>
                </div>
              </div>
            </MenuHandler>
            <MenuList className={`w-64 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
              {/* User Info Header */}
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <Avatar
                    variant="circular"
                    size="md"
                    alt={user?.username || "User"}
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
                  />
                  <div>
                    <Typography variant="h6" color={isDark ? "white" : "blue-gray"}>
                      {user?.username || "User"}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {user?.email || "user@example.com"}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <MenuItem className={`flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <Link to="/dashboard/read" className="flex items-center gap-3 w-full">
                  <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Read Grievances
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className={`flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <Link to="/dashboard/saved-grievances" className="flex items-center gap-3 w-full">
                  <BellIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Saved Grievances
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className={`flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <Link to="/dashboard/search-history" className="flex items-center gap-3 w-full">
                  <MagnifyingGlassIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Search History
                  </Typography>
                </Link>
              </MenuItem>

              <MenuItem className={`flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <Link to="/change-password" className="flex items-center gap-3 w-full">
                  <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
                    Change Password
                  </Typography>
                </Link>
              </MenuItem>

              {/* Divider */}
              <hr className="my-2 border-gray-200 dark:border-gray-600" />

              {/* Logout */}
              <MenuItem 
                className={`flex items-center gap-3 ${isDark ? 'hover:bg-red-900' : 'hover:bg-red-50'} text-red-600`}
                onClick={logout}
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-600" />
                <Typography variant="small" color="red" className="font-medium">
                  Logout
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </Navbar>

      {/* Detailed Alert Modal */}
    <Dialog 
      open={showAlertModal} 
      handler={() => setShowAlertModal(false)}
      size="lg"
      className={isDark ? 'bg-gray-800' : 'bg-white'}
    >
      <DialogHeader className={`flex items-center justify-between ${isDark ? 'text-white border-gray-600' : 'text-gray-900 border-gray-200'} border-b`}>
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <Typography variant="h5" className={isDark ? 'text-white' : 'text-gray-900'}>
            High Priority Alert Details
          </Typography>
        </div>
        <IconButton
          variant="text"
          onClick={() => setShowAlertModal(false)}
          className={isDark ? 'text-white hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>
      
      <DialogBody className={`max-h-96 overflow-y-auto ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
        {selectedAlert && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <CardBody className="p-4">
                <Typography variant="h6" className={`mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <DocumentTextIcon className="h-5 w-5" />
                  Basic Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Registration No.
                    </Typography>
                    <Typography className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedAlert.registration_no}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Priority Level
                    </Typography>
                    <Chip 
                      value={selectedAlert.priority || 'High'} 
                      color="red" 
                      size="sm" 
                      className="w-fit"
                    />
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Current Status
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.current_status}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Escalation Level
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.escalation_level}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Location & Department */}
            <Card className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <CardBody className="p-4">
                <Typography variant="h6" className={`mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <MapPinIcon className="h-5 w-5" />
                  Location & Department
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      State/District
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.state} / {selectedAlert.district}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Ministry/Department
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.department}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Assigned Officer
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.assigned_officer}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Expected Resolution
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.expected_resolution}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Complainant Details */}
            <Card className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <CardBody className="p-4">
                <Typography variant="h6" className={`mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <UserCircleIcon className="h-5 w-5" />
                  Complainant Details
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Name
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.complainant_name}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Email
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.complainant_email}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Phone
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.complainant_phone}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Grievance Details */}
            <Card className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <CardBody className="p-4">
                <Typography variant="h6" className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Grievance Details
                </Typography>
                <div className="space-y-3">
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Subject
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.subject}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Detailed Description
                    </Typography>
                    <Typography className={`${isDark ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>
                      {selectedAlert.detailed_description}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Priority Reason
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.priority_reason}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Timeline & Actions */}
            <Card className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <CardBody className="p-4">
                <Typography variant="h6" className={`mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <CalendarIcon className="h-5 w-5" />
                  Timeline & Actions
                </Typography>
                <div className="space-y-3">
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Received Date
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {new Date(selectedAlert.recvd_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Last Action Date
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {new Date(selectedAlert.last_action_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Last Action Taken
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.last_action}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Citizen Feedback
                    </Typography>
                    <Typography className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedAlert.citizen_feedback}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Attachments */}
            {selectedAlert.attachments && selectedAlert.attachments.length > 0 && (
              <Card className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <CardBody className="p-4">
                  <Typography variant="h6" className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Attachments
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.attachments.map((attachment, idx) => (
                      <Chip
                        key={idx}
                        value={attachment}
                        variant="outlined"
                        className={`${isDark ? 'border-gray-500 text-gray-200' : 'border-gray-300 text-gray-700'}`}
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </DialogBody>
      
      <DialogFooter className={`${isDark ? 'border-gray-600' : 'border-gray-200'} border-t`}>
        <Button
          variant="outlined"
          onClick={() => setShowAlertModal(false)}
          className={`mr-2 ${isDark ? 'border-gray-500 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Close
        </Button>
        <Button
          color="blue"
          onClick={() => {
            // Handle action (e.g., navigate to detailed view)
            console.log('Taking action on alert:', selectedAlert.registration_no);
            setShowAlertModal(false);
          }}
        >
          Take Action
        </Button>
      </DialogFooter>
     </Dialog>
    </>
   );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;