import React, { useState, useEffect } from 'react';
import httpService from '@/services/httpService';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Card,
  CardBody,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  Badge
} from '@material-tailwind/react';
import {
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PrinterIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/context';

const DetailedGrievanceModal = ({ 
  open, 
  onClose, 
  grievance 
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('details');
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  // Fetch detailed user data when modal opens
  useEffect(() => {
    if (open && grievance?.id) {
      fetchUserDetails(grievance.id);
    }
  }, [open, grievance?.id]);

  const fetchUserDetails = async (grievanceId) => {
    setLoadingUserData(true);
    try {
      console.log('🔍 Fetching detailed user data for ID:', grievanceId);
      console.log('🔍 Request payload:', { ids: [grievanceId.toString()] });
      
      // Call the get_userdata API with the specific grievance ID
      const response = await httpService.post('/get_userdata', {
        ids: [grievanceId.toString()]
      });
      
      console.log('📋 Full API Response from /get_userdata:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        const userData = response.data.data[0];
        setUserDetails(userData);
        console.log('✅ Successfully fetched detailed user data:', userData);
      } else if (response.data && response.data.length > 0) {
        // Fallback for direct array response
        const userData = response.data[0];
        setUserDetails(userData);
        console.log('✅ Successfully fetched user data (fallback):', userData);
      } else {
        console.log('⚠️ No detailed user data found for ID:', grievanceId);
        console.log('⚠️ Response structure:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching detailed user data:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
    } finally {
      setLoadingUserData(false);
    }
  };

  if (!grievance) {
    console.log('❌ DetailedGrievanceModal: No grievance data provided');
    return null;
  }
  
  console.log('📋 DetailedGrievanceModal: Rendering with grievance:', grievance);

  // Use detailed user data if available, otherwise fallback to grievance data
  const displayData = userDetails || grievance.originalData || grievance;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00 00:00:00' || dateString === 'nan') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return 'gray';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('dispose') || statusLower.includes('closed')) return 'green';
    if (statusLower.includes('pending')) return 'orange';
    if (statusLower.includes('reject')) return 'red';
    return 'blue';
  };

  // Get complaint type color
  const getComplaintTypeColor = (type) => {
    if (!type) return 'gray';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('complaint')) return 'red';
    if (typeLower.includes('query')) return 'blue';
    if (typeLower.includes('suggestion')) return 'green';
    return 'gray';
  };

  // Info Row Component
  const InfoRow = ({ icon: Icon, label, value, color = "gray" }) => {
    if (!value || value === 'N/A' || value === 'nan' || value === 'Email not available' || value === 'Phone not available') {
      return null;
    }
    
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className={`h-5 w-5 text-${color}-500 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <Typography variant="small" color="gray" className="text-xs font-medium mb-1">
            {label}
          </Typography>
          <Typography variant="small" color={isDark ? "white" : "blue-gray"} className="font-medium">
            {value}
          </Typography>
        </div>
      </div>
    );
  };

  // Tab Button Component
  const TabButton = ({ id, label, isActive, onClick }) => (
    <Button
      variant={isActive ? "filled" : "outlined"}
      size="sm"
      onClick={() => onClick(id)}
      className={`px-4 py-2 ${isActive ? '' : 'bg-transparent'}`}
    >
      {label}
    </Button>
  );

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50" 
          onClick={onClose}
          style={{ display: 'flex', visibility: 'visible' }}
        >
          <div 
            className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden`} 
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'block', visibility: 'visible', opacity: 1 }}
          >
            {/* Header */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b flex items-center justify-between p-4`}>
              <div className="flex items-center gap-4">
                <div>
                  <Typography variant="h5" color={isDark ? "white" : "blue-gray"} className="font-bold">
                    Grievance #{displayData?.registration_no || grievance?.registration_no || displayData?.id || grievance?.id || 'REG-' + Math.random().toString(36).substr(2, 9)}
                  </Typography>
                  <div className="flex items-center gap-2 mt-1">
                    {loadingUserData && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                        <Typography variant="small" color="gray">Loading details...</Typography>
                      </div>
                    )}

                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Tooltip content="Print">
                  <IconButton variant="outlined" size="sm">
                    <PrinterIcon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Share">
                  <IconButton variant="outlined" size="sm">
                    <ShareIcon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
                <IconButton variant="outlined" size="sm" onClick={onClose}>
                  <XMarkIcon className="h-5 w-5" />
                </IconButton>
              </div>
            </div>

            {/* Tabs */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b px-4 py-2`}>
              <div className="flex gap-2">
                <TabButton
                  id="details"
                  label="Details"
                  isActive={activeTab === 'details'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="timeline"
                  label="Timeline"
                  isActive={activeTab === 'timeline'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="contact"
                  label="Contact Info"
                  isActive={activeTab === 'contact'}
                  onClick={setActiveTab}
                />
              </div>
            </div>

            {/* Body */}
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              <div className="p-6">
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Complaint Details */}
                    <Card className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} shadow-sm`}>
                      <CardBody className="p-4">
                        <Typography variant="h6" className={`${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                          <DocumentTextIcon className="h-5 w-5" />
                          Complaint Details
                        </Typography>
                        
                        <Typography color={isDark ? "white" : "blue-gray"} className="text-sm leading-6">
                          {displayData?.complaintDetails || grievance?.complaintDetails || displayData?.subject_content || grievance?.subject_content || displayData?.grievance_desc || grievance?.grievance_desc || 'No details available'}
                        </Typography>
                      </CardBody>
                    </Card>

                    {/* Basic Information */}
                    <Card className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} shadow-sm`}>
                      <CardBody className="p-4">
                        <Typography variant="h6" className={`${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                          <InformationCircleIcon className="h-5 w-5" />
                          Basic Information
                        </Typography>
                        
                        <div className="space-y-3">
                          <InfoRow 
                            icon={CalendarIcon} 
                            label="Registration Date" 
                            value={formatDate(displayData.complaintRegDate || displayData.recvd_date || grievance.complaintRegDate || grievance.recvd_date)}
                            color="blue"
                          />
                          
                          <InfoRow 
                            icon={DocumentTextIcon} 
                            label="Complaint Mode" 
                            value={displayData.complaintMode || grievance.complaintMode}
                            color="green"
                          />
                          
                          <InfoRow 
                            icon={BuildingOfficeIcon} 
                            label="Company/Ministry" 
                            value={displayData.companyName || displayData.ministry || grievance.companyName || grievance.ministry}
                            color="purple"
                          />
                          
                          <InfoRow 
                            icon={InformationCircleIcon} 
                            label="Category Code" 
                            value={displayData.categoryCode || grievance.categoryCode}
                            color="indigo"
                          />
                          
                          <InfoRow 
                            icon={InformationCircleIcon} 
                            label="User ID" 
                            value={displayData.userId || grievance.userId}
                            color="cyan"
                          />
                          
                          {(displayData.closing_date || grievance.closing_date) && (
                            <InfoRow 
                              icon={CalendarIcon} 
                              label="Closing Date" 
                              value={formatDate(displayData.closing_date || grievance.closing_date)}
                              color="red"
                            />
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <Typography variant="h6" className={`${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                      Grievance Timeline
                    </Typography>
                    
                    <Timeline>
                      <TimelineItem>
                        <TimelineConnector />
                        <TimelineHeader className="h-3">
                          <TimelineIcon className="p-2" color="blue">
                            <DocumentTextIcon className="h-4 w-4" />
                          </TimelineIcon>
                          <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="leading-none text-sm">
                            Grievance Registered
                          </Typography>
                        </TimelineHeader>
                        <TimelineBody className="pb-8">
                          <Typography variant="small" color="gray" className="font-normal">
                            {formatDate(displayData.complaintRegDate || displayData.recvd_date || grievance.complaintRegDate || grievance.recvd_date)}
                          </Typography>
                          <Typography variant="small" color="gray" className="font-normal">
                            Complaint submitted via {displayData.complaintMode || grievance.complaintMode || 'Unknown'}
                          </Typography>
                        </TimelineBody>
                      </TimelineItem>
                    </Timeline>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <Card className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} shadow-sm`}>
                      <CardBody className="p-4">
                        <Typography variant="h6" className={`${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                          <UserIcon className="h-5 w-5" />
                          Complainant Information
                        </Typography>
                        
                        <div className="space-y-3">
                          <InfoRow 
                            icon={UserIcon} 
                            label="Full Name" 
                            value={displayData.fullName || grievance.fullName || displayData.name || grievance.name}
                            color="blue"
                          />
                          
                          <InfoRow 
                            icon={MapPinIcon} 
                            label="Location" 
                            value={`${displayData.CityName || grievance.CityName || ''}, ${displayData.stateName || grievance.stateName || ''}`}
                            color="green"
                          />
                          
                          <InfoRow 
                            icon={InformationCircleIcon} 
                            label="User ID" 
                            value={displayData.userId || grievance.userId}
                            color="gray"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t p-4`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Typography variant="small" color="gray">
                    Grievance ID: {grievance.id}
                  </Typography>
                  {grievance.status !== undefined && (
                    <Badge content={grievance.status ? "Active" : "Inactive"} color={grievance.status ? "green" : "red"}>
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outlined" size="sm" onClick={onClose}>
                    Close
                  </Button>
                  <Button size="sm" className="flex items-center gap-2">
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    Open Full View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailedGrievanceModal;