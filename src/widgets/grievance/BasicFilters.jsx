import React, { useState } from 'react';
import { MagnifyingGlassIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '@material-tailwind/react';

export function BasicFilters({
  ministry,
  setMinistry,
  from,
  setFrom,
  to,
  setTo,
  searching,
  startSearch
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDateRangeExpanded, setIsDateRangeExpanded] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSearch = () => {
    if (startSearch) {
      startSearch();
    }
  };

  const toggleDateRange = () => {
    setIsDateRangeExpanded(!isDateRangeExpanded);
  };

  const openDatePicker = () => {
    setIsDatePickerOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-3 mb-2 mt-1">
      {/* Calendar Icon and Collapsible Date Range */}
      <div className="flex items-center gap-2">
        <CalendarIcon 
          className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={toggleDateRange}
        />
        
        {isDateRangeExpanded && (
          <div 
            className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
            onClick={openDatePicker}
          >
            <span className="text-gray-700 font-medium">
              {formatDate(from)} - {formatDate(to)}
            </span>
          </div>
        )}
      </div>

      {/* Search Input - Made bigger and moved up */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search grievances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            containerProps={{
              className: "min-w-0"
            }}
          />
        </div>
      </div>

      {/* Ministry Chip - Compact */}
      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
        DOCAF
      </div>

      {/* Analyze Button - Compact */}
      <Button
        onClick={handleSearch}
        disabled={searching}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        size="sm"
      >
        {searching ? 'Analyzing...' : 'ANALYZE'}
      </Button>

      {/* Date Picker Modal/Popup - Placeholder for future implementation */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Select Date Range</h3>
            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outlined"
                onClick={() => setIsDatePickerOpen(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsDatePickerOpen(false);
                  handleSearch();
                }}
                size="sm"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterLayout({
  children,
  className = ''
}) {
  return (
    <div className={`mb-6 grid grid-cols-1 gap-y-4 gap-x-6 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {children}
    </div>
  )
}

export const SearchButton = ({
  searching = false,
  startSearch = () => '',
  actionText = 'Search',
  loadingText = 'Searching...',
  color = 'blue',
  className = '',
  icon = <div></div>,
  disabled = false
}) => {
  return <Button
    className={`h-[2rem] flex justify-center items-center select-none text-xs ${className}`}
    onClick={startSearch}
    disabled={searching || disabled}
    color={color}
    size="sm"
  >
    {
      searching &&
      <Loader className="mr-1 animate-spin w-3 h-3" color="#fff" />
    }

    {
      icon
    }

    <span>
      {
        searching
          ? loadingText
          : actionText
      }
    </span>
  </Button>
}