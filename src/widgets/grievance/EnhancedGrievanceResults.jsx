import React, { useState, useMemo, useEffect } from 'react';
import httpService from '@/services/httpService';
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Button,
  IconButton,
  Input,
  Select,
  Option,
  Tooltip,
  Badge,
  Progress
} from '@material-tailwind/react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/context';

const EnhancedGrievanceResults = ({ 
  grievances = [], 
  loading = false,
  total = 0,
  count = 0,
  pageno = 1,
  onPageChange,
  onViewDetails,
  onDownload,
  downloading = false
}) => {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table' - default to table for horizontal list
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ministryFilter, setMinistryFilter] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null); // Track expanded card

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00 00:00:00') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Truncate text helper
  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

  // Debug: Log incoming data
  console.log('🎯 EnhancedGrievanceResults received data:', {
    grievancesArray: grievances,
    grievancesLength: grievances?.length,
    grievancesType: typeof grievances,
    isArray: Array.isArray(grievances),
    loading: loading,
    total: total,
    count: count,
    pageno: pageno,
    sampleGrievance: grievances?.[0]
  });

  // Filter and sort grievances
  const processedGrievances = useMemo(() => {
    let filtered = grievances.filter(grievance => {
      const matchesSearch = !searchQuery || 
        (grievance.complaintDetails && grievance.complaintDetails.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (grievance.id && grievance.id.toString().includes(searchQuery)) ||
        (grievance.fullName && grievance.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
        (grievance.complaintStatus && grievance.complaintStatus.toLowerCase().includes(statusFilter));
      
      const matchesMinistry = ministryFilter === 'all' || 
        (grievance.companyName && grievance.companyName.toLowerCase().includes(ministryFilter.toLowerCase()));
      
      return matchesSearch && matchesStatus && matchesMinistry;
    });

    // Sort grievances
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.complaintRegDate || '1970-01-01');
          bValue = new Date(b.complaintRegDate || '1970-01-01');
          break;
        case 'status':
          aValue = a.complaintStatus || '';
          bValue = b.complaintStatus || '';
          break;
        case 'ministry':
          aValue = a.companyName || '';
          bValue = b.companyName || '';
          break;
        case 'location':
          aValue = `${a.stateName || ''} ${a.CityName || ''}`;
          bValue = `${b.stateName || ''} ${b.CityName || ''}`;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [grievances, searchQuery, statusFilter, ministryFilter, sortBy, sortOrder]);

  // Get unique values for filters
  const uniqueStatuses = [...new Set(grievances.map(g => g.complaintStatus).filter(Boolean))];
  const uniqueMinistries = [...new Set(grievances.map(g => g.companyName).filter(Boolean))];

  // Pagination calculations
  const recordsPerPage = 20;
  const totalPages = Math.ceil(total / recordsPerPage);
  const startRecord = (pageno - 1) * recordsPerPage + 1;
  const endRecord = Math.min(pageno * recordsPerPage, total);

  // Pagination Component
  const PaginationComponent = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, pageno - 2);
        const end = Math.min(totalPages, start + maxVisiblePages - 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <Typography variant="small" color="gray">
          Showing {startRecord}-{endRecord} of {total?.toLocaleString()} results
        </Typography>
        
        <div className="flex items-center gap-1">
          {/* First Page */}
          <IconButton
            variant="outlined"
            size="sm"
            onClick={() => onPageChange && onPageChange(1)}
            disabled={pageno === 1}
            className="h-8 w-8"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </IconButton>
          
          {/* Previous Page */}
          <IconButton
            variant="outlined"
            size="sm"
            onClick={() => onPageChange && onPageChange(pageno - 1)}
            disabled={pageno === 1}
            className="h-8 w-8"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </IconButton>
          
          {/* Page Numbers */}
          {getPageNumbers().map(pageNum => (
            <Button
              key={pageNum}
              variant={pageNum === pageno ? "filled" : "outlined"}
              size="sm"
              onClick={() => onPageChange && onPageChange(pageNum)}
              className="h-8 w-8 p-0 min-w-0"
            >
              {pageNum}
            </Button>
          ))}
          
          {/* Next Page */}
          <IconButton
            variant="outlined"
            size="sm"
            onClick={() => onPageChange && onPageChange(pageno + 1)}
            disabled={pageno === totalPages}
            className="h-8 w-8"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </IconButton>
          
          {/* Last Page */}
          <IconButton
            variant="outlined"
            size="sm"
            onClick={() => onPageChange && onPageChange(totalPages)}
            disabled={pageno === totalPages}
            className="h-8 w-8"
          >
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    );
  };

  // Card View Component
  const GrievanceCard = ({ grievance, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [apiData, setApiData] = useState(null);
    const [loadingApiData, setLoadingApiData] = useState(false);
    
    const formatDate = (dateString) => {
      if (!dateString || dateString === '0000-00-00 00:00:00' || dateString === 'nan') return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return 'N/A';
      }
    };
    
    const fetchApiData = async (grievanceId) => {
      setLoadingApiData(true);
      try {
        console.log('🔍 Fetching API data for ID:', grievanceId);
        const response = await httpService.post('/get_userdata', {
          ids: [grievanceId.toString()]
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          setApiData(response.data.data[0]);
          console.log('✅ API data fetched:', response.data.data[0]);
        } else {
          console.log('⚠️ No API data found');
        }
      } catch (error) {
        console.error('❌ Error fetching API data:', error);
      } finally {
        setLoadingApiData(false);
      }
    };
    
    const handleCardClick = () => {
      setIsExpanded(!isExpanded);
      if (!isExpanded && !apiData && !loadingApiData) {
        fetchApiData(grievance.id);
      }
    };
    
    return (
    <Card
      key={grievance.id || index}
      className={`
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
        border transition-all duration-200 hover:shadow-lg
        cursor-pointer group
        ${isExpanded ? 'shadow-xl' : ''}
      `}
       onClick={handleCardClick}
     >
      <CardBody className="p-4">
        {/* Header with ID and Status */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Typography
              variant="h6"
              color={isDark ? "white" : "blue-gray"}
              className="text-sm font-bold truncate max-w-[180px]"
            >
              #{grievance.id || 'N/A'}
            </Typography>
            {grievance.complaintType && (
              <Chip
                value={grievance.complaintType}
                color={getComplaintTypeColor(grievance.complaintType)}
                size="sm"
                className="text-xs font-medium"
              />
            )}
          </div>
          
          <Chip
            value={grievance.complaintStatus || 'Pending'}
            color={getStatusColor(grievance.complaintStatus)}
            size="sm"
            className="text-xs font-medium"
          />
        </div>

        {/* Complaint Details */}
        <div className="mb-3">
          <Typography
            variant="small"
            color={isDark ? "gray" : "blue-gray"}
            className="text-xs font-medium mb-1 opacity-80"
          >
            Complaint Details
          </Typography>
          <Typography
            color={isDark ? "white" : "blue-gray"}
            className="text-sm leading-5 line-clamp-3"
          >
            {truncateText(grievance.complaintDetails, 150)}
          </Typography>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 mb-4">
          {/* Registration Date */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <Typography variant="small" color="gray" className="text-xs">
              {formatDate(grievance.complaintRegDate)}
            </Typography>
          </div>

          {/* Company/Ministry */}
          {grievance.companyName && (
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
              <Typography variant="small" color="gray" className="text-xs truncate">
                {truncateText(grievance.companyName, 30)}
              </Typography>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <Typography variant="small" color="gray" className="text-xs truncate">
              {grievance.CityName}, {grievance.stateName}
            </Typography>
          </div>

          {/* Complainant */}
          {grievance.fullName && (
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <Typography variant="small" color="gray" className="text-xs truncate">
                {grievance.fullName}
              </Typography>
            </div>
          )}

          {/* Complaint Mode */}
          {grievance.complaintMode && (
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <Typography variant="small" color="gray" className="text-xs">
                {grievance.complaintMode}
              </Typography>
            </div>
          )}
        </div>

        {/* Expand/Collapse Indicator */}
         <div className="flex items-center gap-2">
           <IconButton size="sm" variant="outlined">
             {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
           </IconButton>
         </div>
        
        {/* Expanded Details */}
         {isExpanded && (
           <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
             {/* Loading State */}
             {loadingApiData && (
               <div className="flex items-center justify-center py-4">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                 <Typography variant="small" color="gray" className="ml-2">
                   Loading additional details...
                 </Typography>
               </div>
             )}
             
             {/* Complete Complaint Details */}
             <div>
               <Typography variant="small" className="font-medium text-gray-700 mb-2">
                 Complete Complaint Details:
               </Typography>
               <Typography variant="small" color="gray" className="text-sm leading-relaxed">
                 {(apiData && apiData.complaintDetails) || grievance.complaintDetails || 'No details available'}
               </Typography>
             </div>
            
            {/* Enhanced Information Layout */}
             <div className="bg-gray-50 rounded-lg p-4 space-y-4">
               {/* User Information Section */}
               <div className="bg-white rounded-lg p-4 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                   <UserIcon className="h-5 w-5 text-blue-500" />
                   <Typography variant="h6" className="font-semibold text-gray-800">
                     User Information
                   </Typography>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-600">Full Name:</span>
                       <span className="text-sm font-medium">{(apiData && apiData.fullName) || grievance.fullName || 'N/A'}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-600">User ID:</span>
                       <span className="text-sm font-medium">{(apiData && apiData.userId) || grievance.userId || 'N/A'}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-600">User Type:</span>
                       <span className="text-sm font-medium">{((apiData && apiData.userType !== 'nan') ? apiData.userType : null) || (grievance.userType !== 'nan' ? grievance.userType : 'Individual')}</span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <MapPinIcon className="h-4 w-4 text-green-500" />
                       <span className="text-sm text-gray-600">Location:</span>
                       <span className="text-sm font-medium">{(apiData && apiData.CityName) || grievance.CityName || 'N/A'}, {(apiData && apiData.stateName) || grievance.stateName || 'N/A'}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-600">Country:</span>
                       <span className="text-sm font-medium">{((apiData && apiData.country !== 'nan') ? apiData.country : null) || (grievance.country !== 'nan' ? grievance.country : 'N/A')}</span>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Registration Information Section */}
               <div className="bg-white rounded-lg p-4 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                   <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                   <Typography variant="h6" className="font-semibold text-gray-800">
                     Registration Information
                   </Typography>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <CalendarIcon className="h-4 w-4 text-blue-500" />
                       <span className="text-sm text-gray-600">Registration Date:</span>
                       <span className="text-sm font-medium">{formatDate((apiData && apiData.complaintRegDate) || grievance.complaintRegDate)}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-600">Category Code:</span>
                       <span className="text-sm font-medium">{(apiData && apiData.categoryCode) || grievance.categoryCode || 'N/A'}</span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-600">Complaint Type:</span>
                       <span className="text-sm font-medium">{(apiData && apiData.complaintType) || grievance.complaintType || 'N/A'}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <PhoneIcon className="h-4 w-4 text-green-500" />
                       <span className="text-sm text-gray-600">Mode:</span>
                       <span className="text-sm font-medium">{(apiData && apiData.complaintMode) || grievance.complaintMode || 'N/A'}</span>
                     </div>
                   </div>
                 </div>
               </div>
              
              {/* Contact & Location Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="h-5 w-5 text-orange-500" />
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    Contact & Location
                  </Typography>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Full Name:</span>
                      <span className="text-sm font-medium">{(apiData && apiData.fullName) || grievance.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">City:</span>
                      <span className="text-sm font-medium">{(apiData && apiData.CityName) || grievance.CityName || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">State:</span>
                      <span className="text-sm font-medium">{(apiData && apiData.stateName) || grievance.stateName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Country:</span>
                      <span className="text-sm font-medium">{((apiData && apiData.country !== 'nan') ? apiData.country : null) || (grievance.country !== 'nan' ? grievance.country : 'N/A')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status & Timeline Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    Status & Timeline
                  </Typography>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Current Status:</span>
                      <span className="text-sm font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">{(apiData && apiData.complaintStatus) || grievance.complaintStatus || 'Active'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Last Update:</span>
                      <span className="text-sm font-medium">{formatDate((apiData && apiData.updationDate) || grievance.updationDate)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Company:</span>
                      <span className="text-sm font-medium">{(apiData && apiData.companyName) || grievance.companyName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">User Type:</span>
                      <span className="text-sm font-medium">{((apiData && apiData.userType !== 'nan') ? apiData.userType : null) || (grievance.userType !== 'nan' ? grievance.userType : 'Individual')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Details Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <DocumentTextIcon className="h-5 w-5 text-indigo-500" />
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    Additional Details
                  </Typography>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Complaint Mode:</span>
                      <span className="text-sm font-medium">{(apiData && apiData.complaintMode) || grievance.complaintMode || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Company Status:</span>
                      <span className="text-sm font-medium">{((apiData && apiData.companyStatus !== 'nan') ? apiData.companyStatus : null) || (grievance.companyStatus !== 'nan' ? grievance.companyStatus : 'N/A')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Last Update Date:</span>
                      <span className="text-sm font-medium">{((apiData && apiData.lastUpdationDate !== 'nan') ? formatDate(apiData.lastUpdationDate) : null) || (grievance.lastUpdationDate !== 'nan' ? formatDate(grievance.lastUpdationDate) : 'N/A')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardBody>
     </Card>
     );
   };

  // Horizontal List View Component
  const HorizontalListView = () => (
    <div className="space-y-3">
      {processedGrievances.map((grievance, index) => (
        <Card
          key={grievance.id || index}
          className={`
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
            border transition-all duration-200 hover:shadow-md cursor-pointer
            ${expandedCard === (grievance.id || index) ? 'shadow-xl' : ''}
          `}
        >
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              {/* Left Section - ID and Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Typography
                    variant="h6"
                    color={isDark ? "white" : "blue-gray"}
                    className="text-sm font-bold"
                  >
                    #{grievance.registration_no || grievance.id || 'REG-' + Math.random().toString(36).substr(2, 9)}
                  </Typography>

                  <IconButton
                    size="sm"
                    variant="text"
                    onClick={(e) => {
                      e.stopPropagation();
                      const cardId = grievance.registration_no || grievance.id || index;
                      setExpandedCard(expandedCard === cardId ? null : cardId);
                    }}
                  >
                    {expandedCard === (grievance.registration_no || grievance.id || index) ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </IconButton>
                </div>
                
                <Typography
                  color={isDark ? "white" : "blue-gray"}
                  className={`text-sm mb-2 ${expandedCard === (grievance.registration_no || grievance.id || index) ? '' : 'line-clamp-2'}`}
                >
                  {expandedCard === (grievance.registration_no || grievance.id || index) 
                    ? (grievance.complaintDetails || grievance.subject_content || grievance.grievance_desc || 'No details available')
                    : truncateText(grievance.complaintDetails || grievance.subject_content || grievance.grievance_desc || 'No details available', 200)
                  }
                </Typography>
                
                <div className="flex items-center gap-6 text-xs text-gray-500">
                  {/* Registration Number */}
                  <div className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>#{grievance.registration_no || grievance.id || 'N/A'}</span>
                  </div>
                  
                  {/* Complainant */}
                  {(grievance.fullName || grievance.name) && (
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{grievance.fullName || grievance.name}</span>
                    </div>
                  )}
                  
                  {/* Location */}
                  {(grievance.CityName || grievance.district || grievance.stateName || grievance.state) && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>
                        {grievance.CityName || grievance.district || 'Unknown'}
                        {(grievance.CityName || grievance.district) && (grievance.stateName || grievance.state) ? ', ' : ''}
                        {grievance.stateName || grievance.state || ''}
                      </span>
                    </div>
                  )}
                  
                  {/* Date */}
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(grievance.complaintRegDate || grievance.recvd_date)}</span>
                  </div>
                  
                  {/* Ministry */}
                  {(grievance.companyName || grievance.ministry) && (
                    <div className="flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span>{truncateText(grievance.companyName || grievance.ministry, 25)}</span>
                    </div>
                  )}
                  
                  {/* Mode */}
                  {grievance.complaintMode && (
                    <div className="flex items-center gap-1">
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>{grievance.complaintMode}</span>
                    </div>
                  )}
                </div>
                
                {/* Expanded Details */}
                {expandedCard === (grievance.registration_no || grievance.id || index) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <Typography variant="h6" color={isDark ? "white" : "blue-gray"} className="text-sm font-semibold mb-3">
                      Additional Details
                    </Typography>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* User Information */}
                      {(grievance.userId || grievance.userType) && (
                        <div className="space-y-2">
                          <Typography variant="small" className="font-medium text-gray-600">
                            User Information
                          </Typography>
                          {grievance.userId && (
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-gray-500" />
                              <span>User ID: {grievance.userId}</span>
                            </div>
                          )}
                          {grievance.userType && grievance.userType !== 'nan' && (
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-gray-500" />
                              <span>User Type: {grievance.userType}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Dates Information */}
                      <div className="space-y-2">
                        <Typography variant="small" className="font-medium text-gray-600">
                          Timeline
                        </Typography>
                        {grievance.complaintRegDate && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span>Registered: {formatDate(grievance.complaintRegDate)}</span>
                          </div>
                        )}
                        {grievance.updationDate && grievance.updationDate !== '0000-00-00 00:00:00' && (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span>Updated: {formatDate(grievance.updationDate)}</span>
                          </div>
                        )}
                        {grievance.closing_date && grievance.closing_date !== '0000-00-00 00:000:00' && (
                          <div className="flex items-center gap-2">
                            <CheckBadgeIcon className="h-4 w-4 text-gray-500" />
                            <span>Closed: {formatDate(grievance.closing_date)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Category Information */}
                      {(grievance.categoryCode || grievance.companyStatus) && (
                        <div className="space-y-2">
                          <Typography variant="small" className="font-medium text-gray-600">
                            Category & Status
                          </Typography>
                          {grievance.categoryCode && (
                            <div className="flex items-center gap-2">
                              <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                              <span>Category Code: {grievance.categoryCode}</span>
                            </div>
                          )}
                          {grievance.companyStatus && grievance.companyStatus !== 'nan' && (
                            <div className="flex items-center gap-2">
                              <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
                              <span>Company Status: {grievance.companyStatus}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Contact Information */}
                      {(grievance.emailaddr || grievance.mobile_no) && (
                        <div className="space-y-2">
                          <Typography variant="small" className="font-medium text-gray-600">
                            Contact Details
                          </Typography>
                          {grievance.emailaddr && grievance.emailaddr !== 'Email not available' && (
                            <div className="flex items-center gap-2">
                              <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                              <span>{grievance.emailaddr}</span>
                            </div>
                          )}
                          {grievance.mobile_no && grievance.mobile_no !== 'Phone not available' && (
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-gray-500" />
                              <span>{grievance.mobile_no}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              

            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Typography variant="h5" color={isDark ? "white" : "blue-gray"} className="font-semibold">
            Grievance Results
          </Typography>
          <Typography variant="small" color="gray">
            {total?.toLocaleString()} total records
          </Typography>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <IconButton
              variant={viewMode === 'cards' ? 'filled' : 'outlined'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-none"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </IconButton>
            <IconButton
              variant={viewMode === 'table' ? 'filled' : 'outlined'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-none"
            >
              <ListBulletIcon className="h-4 w-4" />
            </IconButton>
          </div>
          
          {/* Export Options */}
          <div className="flex items-center gap-2">
            {/* Export CSV */}
            <Tooltip content="Export as CSV">
              <Button
                size="sm"
                variant="outlined"
                className="flex items-center gap-2"
                onClick={() => {
                  const csvData = processedGrievances.map(grievance => ({
                    'ID': grievance.id,
                    'Complaint Details': grievance.complaintDetails,
                    'Complainant Name': grievance.fullName,
                    'City': grievance.CityName,
                    'State': grievance.stateName,
                    'Registration Date': formatDate(grievance.complaintRegDate),
                    'Status': grievance.complaintStatus,
                    'Company/Ministry': grievance.companyName,
                    'Complaint Type': grievance.complaintType,
                    'Complaint Mode': grievance.complaintMode
                  }));
                  
                  const csv = [
                    Object.keys(csvData[0] || {}).join(','),
                    ...csvData.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `grievances_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                disabled={processedGrievances.length === 0}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                CSV
              </Button>
            </Tooltip>
            
            {/* Export JSON */}
            <Tooltip content="Export as JSON">
              <Button
                size="sm"
                variant="outlined"
                className="flex items-center gap-2"
                onClick={() => {
                  const jsonData = {
                    exportDate: new Date().toISOString(),
                    totalRecords: processedGrievances.length,
                    grievances: processedGrievances
                  };
                  
                  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `grievances_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                disabled={processedGrievances.length === 0}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                JSON
              </Button>
            </Tooltip>
            
            {/* Original Download if provided */}
            {onDownload && (
              <Button
                size="sm"
                variant="filled"
                className="flex items-center gap-2"
                onClick={onDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <ArrowDownTrayIcon className="h-4 w-4" />
                )}
                Export All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            label="Search grievances..."
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Sort */}
        <div className="w-full sm:w-48">
          <Select
            label="Sort by"
            value={sortBy}
            onChange={(val) => setSortBy(val)}
          >
            <Option value="date">Date</Option>
            <Option value="status">Status</Option>
            <Option value="ministry">Ministry</Option>
            <Option value="location">Location</Option>
          </Select>
        </div>
        
        {/* Sort Order */}
        <IconButton
          variant="outlined"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="h-10 w-10"
        >
          <ArrowsUpDownIcon className="h-5 w-5" />
        </IconButton>
        
        {/* Filter Toggle */}
        <IconButton
          variant={showFilters ? "filled" : "outlined"}
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 w-10"
        >
          <FunnelIcon className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            >
              <Option value="all">All Statuses</Option>
              {uniqueStatuses.map(status => (
                <Option key={status} value={status.toLowerCase()}>{status}</Option>
              ))}
            </Select>
            
            <Select
              label="Ministry/Company"
              value={ministryFilter}
              onChange={(val) => setMinistryFilter(val)}
            >
              <Option value="all">All Ministries</Option>
              {uniqueMinistries.slice(0, 10).map(ministry => (
                <Option key={ministry} value={ministry.toLowerCase()}>
                  {truncateText(ministry, 30)}
                </Option>
              ))}
            </Select>
          </div>
        </Card>
      )}

      {/* Results */}
      <Card className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <CardBody className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Loading Grievances...
                </Typography>
                <Typography variant="small" color="gray">
                  Please wait while we fetch the data
                </Typography>
              </div>
            </div>
          ) : processedGrievances.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  No Grievances Found
                </Typography>
                <Typography variant="small" color="gray">
                  Try adjusting your search criteria or filters
                </Typography>
              </div>
            </div>
          ) : (
            <>
              {/* Content */}
              {viewMode === 'cards' ? (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {processedGrievances.map((grievance, index) => (
                    <GrievanceCard key={grievance.id || index} grievance={grievance} index={index} />
                  ))}
                </div>
              ) : (
                <HorizontalListView />
              )}
              
              {/* Pagination */}
              <PaginationComponent />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default EnhancedGrievanceResults;