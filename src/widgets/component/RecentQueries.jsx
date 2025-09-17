import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const RecentQueries = ({ queries = [] }) => {
  const [recentQueries, setRecentQueries] = useState([]);

  // Sample data for recent user grievance queries (max 10) - Mix of English and Hindi
   const sampleQueries = [
     {
       id: 1,
       query: "Water supply problem - नल से गंदा पानी आ रहा है",
       dateTime: "2025-01-13 15:30:45",
       resultsCount: 1247,
       status: "completed",
       ministry: "Jal Shakti",
       dateRange: "2024-12-01 to 2025-01-13"
     },
     {
       id: 2,
       query: "Road condition is very bad - सड़क में बहुत गड्ढे हैं",
       dateTime: "2025-01-13 14:22:18",
       resultsCount: 892,
       status: "processing",
       ministry: "Road Transport",
       dateRange: "2025-01-06 to 2025-01-13"
     },
     {
       id: 3,
       query: "Hospital me doctor nahi milte - स्वास्थ्य सेवा की कमी",
       dateTime: "2025-01-13 13:45:32",
       resultsCount: 2156,
       status: "completed",
       ministry: "Health & Family Welfare",
       dateRange: "2024-12-29 to 2025-01-13"
     },
     {
       id: 4,
       query: "Electricity problem - दिन में 8 घंटे power cut",
       dateTime: "2025-01-13 12:18:09",
       resultsCount: 567,
       status: "completed",
       ministry: "Power",
       dateRange: "2024-11-14 to 2025-01-13"
     },
     {
       id: 5,
       query: "Ration card बनवाने में delay - 6 months से pending",
       dateTime: "2025-01-13 11:55:47",
       resultsCount: 1834,
       status: "processing",
       ministry: "Food & Public Distribution",
       dateRange: "2024-12-14 to 2025-01-13"
     }
   ];

  useEffect(() => {
    // Use provided queries or fallback to sample data
    setRecentQueries(queries.length > 0 ? queries : sampleQueries);
  }, [queries]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'amber';
      case 'failed':
        return 'red';
      default:
        return 'blue-gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'processing':
        return <ClockIcon className="h-4 w-4" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  return (
    <Card className="h-full w-full shadow-sm border border-gray-200 bg-white">
      <CardHeader 
        floated={false} 
        shadow={false} 
        className="rounded-none bg-gray-50 text-gray-800 m-0 p-6 border-b border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <Typography variant="h5" className="font-semibold text-gray-800">
                 Recent User Grievance Queries
               </Typography>
               <Typography variant="small" className="text-gray-600 font-normal">
                 Latest user grievance submissions and search activities
               </Typography>
            </div>
          </div>
          <Chip
            value={`${recentQueries.length} Queries`}
            className="bg-gray-100 text-gray-700 border-gray-300"
            size="sm"
          />
        </div>
      </CardHeader>

      <CardBody className="overflow-x-auto px-0 py-0">
        <div className="min-w-max">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="col-span-4">
               <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wide">
                 Grievance Query
               </Typography>
             </div>
            <div className="col-span-2">
              <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wide">
                Date & Time
              </Typography>
            </div>
            <div className="col-span-2">
              <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wide">
                Results
              </Typography>
            </div>
            <div className="col-span-2">
              <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wide">
                Status
              </Typography>
            </div>
            <div className="col-span-2">
              <Typography variant="small" className="font-semibold text-gray-700 uppercase tracking-wide">
                Actions
              </Typography>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {recentQueries.map((query, index) => {
              const { date, time } = formatDateTime(query.dateTime);
              
              return (
                <div 
                  key={query.id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-all duration-200 group"
                >
                  {/* Query Column */}
                  <div className="col-span-4 flex flex-col">
                    <Typography variant="small" className="font-semibold text-gray-800 mb-1">
                      {query.query}
                    </Typography>
                    <Typography variant="tiny" className="text-gray-500">
                      Ministry: {query.ministry} • {query.dateRange}
                    </Typography>
                  </div>

                  {/* Date & Time Column */}
                  <div className="col-span-2 flex flex-col">
                    <Typography variant="small" className="font-medium text-gray-700">
                      {date}
                    </Typography>
                    <Typography variant="tiny" className="text-gray-500">
                      {time}
                    </Typography>
                  </div>

                  {/* Results Column */}
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-full">
                        <DocumentTextIcon className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <Typography variant="small" className="font-semibold text-gray-800">
                          {formatNumber(query.resultsCount)}
                        </Typography>
                        <Typography variant="tiny" className="text-gray-500">
                          records
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Status Column */}
                  <div className="col-span-2 flex items-center">
                    <Chip
                      icon={getStatusIcon(query.status)}
                      value={query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                      className={`
                        ${query.status === 'completed' 
                          ? 'bg-gray-100 text-gray-700 border-gray-300' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                        } 
                        text-xs font-medium px-3 py-1 capitalize
                      `}
                      size="sm"
                    />
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-2 flex items-center justify-end">
                    <Menu>
                      <MenuHandler>
                        <IconButton 
                          variant="text" 
                          className="h-8 w-8 text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </IconButton>
                      </MenuHandler>
                      <MenuList className="min-w-[120px] border-gray-200 shadow-sm">
                        <MenuItem className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50">
                          <MagnifyingGlassIcon className="h-4 w-4" />
                          View Details
                        </MenuItem>
                        <MenuItem className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50">
                          <DocumentTextIcon className="h-4 w-4" />
                          Export Results
                        </MenuItem>
                        <MenuItem className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50">
                          <ClockIcon className="h-4 w-4" />
                          Rerun Query
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {recentQueries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
            </div>
            <Typography variant="h6" className="text-gray-600 mb-2">
               No Recent Grievance Queries
             </Typography>
             <Typography variant="small" className="text-gray-400 text-center max-w-sm">
               Recent user grievance queries will appear here once users start submitting grievances.
             </Typography>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentQueries;