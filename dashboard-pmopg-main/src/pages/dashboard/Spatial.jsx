import React, { useCallback, useEffect, useState } from "react";
import { formatDate, dateBefore } from "@/helpers/date";
import mapService from "@/services/maps"
import { getDefaultDepartment, getDepartmentList, stateData } from "@/data";
import { countDayDuration, defaultThreshold } from "@/helpers/env";
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2";
import { toast } from "react-toastify";
import { Button, Input, Select, Option, Checkbox } from "@material-tailwind/react";
import { MagnifyingGlassIcon, ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { setOpenConfigurator, useMaterialTailwindController } from "@/context";
import stateMapping from '@/data/state-data'

export function Spatial() {
  const [ministry, setMinistry] = React.useState(getDefaultDepartment())
  const [from, setFrom] = React.useState(dateBefore(countDayDuration))
  const [to, setTo] = React.useState(formatDate())
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('grievance')
  const [state, setState] = useState('All')
  const [district, setDistrict] = useState('All')
  const [districtList, setDistrictList] = useState(['All'])
  const [type, setType] = useState(1) // 1=Semantic, 2=Keyword
  const [showClosed, setShowClosed] = useState(true)
  const [threshold, setThreshold] = useState(1.2)
  const [savedSearch, setSavedSearch] = useState({ ministry, from, to, query, state, district, type, showClosed, threshold })
  const [dateRange, setDateRange] = useState({
    start: dateBefore(countDayDuration),
    end: formatDate()
  })
  const [grievances, setGrievances] = useState([])

  const getDistricts = useCallback(async state => {
    if (state === 'All') return []
    
    console.log(`${savedSearch.ministry} 🗺️ Fetching district-wise distribution for state:`, state)
    console.log('District analysis filters:', {
      state,
      ministry: savedSearch.ministry,
      dateRange: `${savedSearch.from} to ${savedSearch.to}`,
      query: savedSearch.query,
      threshold: savedSearch.threshold,
      totalGrievances: grievances.length
    })
    
    try {
      // Filter grievances for this specific state
      const stateGrievances = grievances.filter(g =>
        (g.state || g.state_name || '').toLowerCase() === state.toLowerCase()
      )
      
      console.log(`${savedSearch.ministry} 📊 Processing ${grievances.length} grievances for ${state} district analysis`)
      console.log(`${savedSearch.ministry} 🎯 Found ${stateGrievances.length} grievances in ${state}`)
      
      if (stateGrievances.length === 0) {
        console.log(`${savedSearch.ministry} ⚠️ No grievances found in ${state} for current filters`)
        return []
      }
      
      // Group by district
      const districtCounts = stateGrievances.reduce((acc, grievance) => {
        const district = grievance.district || grievance.district_name || 'Unknown'
        acc[district] = (acc[district] || 0) + 1
        return acc
      }, {})
      
      console.log(`${savedSearch.ministry} 📈 District distribution for ${state}:`, districtCounts)
      
      // Format as expected by HeatMap2 component
      const districts = Object.entries(districtCounts).map(([name, count]) => ({
        name,
        count,
        state
      })).sort((a, b) => b.count - a.count)
      
      console.log(`${savedSearch.ministry} 🎯 Top districts in ${state}:`,
        districts.slice(0, 5).map(d => `${d.name}: ${d.count}`)
      )
      console.log('Districts loaded:', districts.length, 'districts for', state)
      
      return districts
    } catch (error) {
      console.error(`${savedSearch.ministry} ❌ District analysis error for ${state}:`, error)
      toast.error(`Error analyzing districts in ${state}: ${error.message}`)
      return []
    }
  }, [savedSearch, grievances])

  const handleSearch = () => {
    console.log('🔘 SEARCH BUTTON CLICKED - handleSearch function reached')
    console.log('🎯 Current component state:', {
      ministry,
      startDate: dateRange.start,
      endDate: dateRange.end,
      query,
      state,
      district,
      type,
      showClosed,
      threshold
    })
    
    // Validation
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }
    
    if (!dateRange.start || !dateRange.end) {
      toast.error('Please select a date range')
      return
    }
    
    // Test if mapService is available
    if (!mapService || !mapService.getHeatmapGrievances) {
      console.error('❌ getHeatmapGrievances function missing!')
      toast.error('Spatial service not loaded properly')
      return
    }
    
    const asyncSearch = async () => {
      try {
        setSearching(true)
        console.log('🚀 Spatial search STARTED with filters:', {
          ministry,
          startDate: dateRange.start,
          endDate: dateRange.end,
          query,
          state,
          district,
          type,
          showClosed,
          threshold
        })
        
        const response = await mapService.getHeatmapGrievances(
          ministry,
          dateRange.start,
          dateRange.end,
          query,
          type,
          state,
          district,
          showClosed ? 1 : 0,
          threshold
        )
        
        console.log('📡 API Response:', {
          status: response.status,
          grievances: (response.data.grievanceData || response.data.data || []).length,
          total: response.data.totalCount || response.data.count || 0
        })
        
        let grievances = response.data.grievanceData || response.data.data || []
        if (!Array.isArray(grievances)) grievances = []
        
        // Normalize for heatmap
        const processedGrievances = grievances.map(g => ({
          ...g,
          state: g.state || g.state_name || g.StateName || 'Unknown',
          district: g.district || g.district_name || g.CityName || 'Unknown'
        })).filter(g => g.state !== 'Unknown')
        
        setGrievances(processedGrievances)
        setSavedSearch({
          ministry,
          from: dateRange.start,
          to: dateRange.end,
          query,
          state,
          district,
          type,
          showClosed,
          threshold
        })
        
        if (processedGrievances.length === 0) {
          toast.warning(`No results found for "${query}". Try adjusting filters.`)
        } else {
          toast.success(`Found ${processedGrievances.length} spatial grievances`)
        }
        
      } catch (error) {
        console.error('❌ Spatial search failed:', error)
        toast.error(`Search failed: ${error.response?.data?.message || error.message}`)
      } finally {
        setSearching(false)
      }
    }
    
    asyncSearch()
  }

  // Update from/to state when dateRange changes (for compatibility)
  useEffect(() => {
    setFrom(dateRange.start)
    setTo(dateRange.end)
  }, [dateRange])
  
  // Remove auto-search - only manual trigger for better control

  const updateStateDistrict = (stateName) => {
    setState(stateName)
    setDistrictList(['All', ...(stateMapping[stateName] || [])])
    setDistrict('All')
  }

  useEffect(() => {
    console.log('🌟 Spatial component MOUNTED')
    // Don't auto-search on mount - let user control
  }, [])

  return (
    <div className="space-y-6">
      {/* Redesigned Filter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Query Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-blue-600" />
            Search Query
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Natural Language Query
              </label>
              <Input
                label="Enter your search query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-sm"
                placeholder="e.g., 'issues with pension payments in rural areas'"
                size="lg"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search Type
              </label>
              <Select
                label="Select search method"
                value={type.toString()}
                onChange={(value) => setType(parseInt(value))}
                className="text-sm"
              >
                <Option value="1">Semantic Search (AI-powered understanding)</Option>
                <Option value="2">Keyword Search (exact phrase matching)</Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-green-600" />
            Location Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ministry
              </label>
              <Select
                label="Select ministry"
                value={ministry}
                onChange={setMinistry}
                className="text-sm"
              >
                {getDepartmentList().map((item, key) => (
                  <Option key={key} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State
              </label>
              <Select
                label="Select state"
                value={state}
                onChange={updateStateDistrict}
                className="text-sm"
              >
                <Option value="All">All States</Option>
                {stateData.map((item, key) => (
                  <Option key={key} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </div>
            
            {districtList.length > 1 && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  District
                </label>
                <Select
                  label="Select district"
                  value={district}
                  onChange={setDistrict}
                  className="text-sm"
                >
                  <Option value="All">All Districts</Option>
                  {districtList.slice(1).map((dist, key) => (
                    <Option key={key} value={dist}>
                      {dist}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Range & Advanced Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date Range Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-purple-600" />
            Date Range
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="text-sm"
                  max={dateRange.end || formatDate()}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  To
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="text-sm"
                  min={dateRange.start || dateBefore(countDayDuration)}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Selected: {dateRange.start} to {dateRange.end}
            </div>
          </div>
        </div>

        {/* Advanced Options Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-orange-600" />
            Advanced Options
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Relevance Threshold
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>More Results (0.5)</span>
                  <span className="font-medium">Threshold: {threshold}</span>
                  <span>More Precise (2.0)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                label="Include closed grievances"
                checked={showClosed}
                onChange={(e) => setShowClosed(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-gray-600">
            Ready to analyze {query ? `"${query}"` : 'grievances'} across {state === 'All' ? 'all states' : state} from {dateRange.start} to {dateRange.end}
          </div>
          
          <Button
            color="blue"
            className="w-full sm:w-auto h-10 px-6 flex items-center gap-2 text-sm font-medium"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
          >
            {searching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-4 w-4" />
                Analyze Spatial Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Spatial Analysis Results</h2>
          <div className="text-sm text-gray-600">
            {grievances.length > 0
              ? `${grievances.length} grievances analyzed | ${[...new Set(grievances.map(g => g.state))].length} states covered`
              : 'No results yet - configure filters above and search'
            }
          </div>
        </div>
        
        <div className="h-[60vh] rounded-lg overflow-hidden">
          <HeatMap2
            grievances={grievances}
            className="w-full h-full"
            getDistricts={getDistricts}
          />
        </div>
      </div>

      {/* Heatmap */}
      <div className="grid grid-cols-1 gap-2 h-[65vh]">
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow border p-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-900">Spatial Heatmap Analysis</h3>
              <div className="text-xs text-gray-500">
                {grievances.length > 0
                  ? `Showing ${grievances.length} grievances across ${[...new Set(grievances.map(g => g.state))].length} states`
                  : 'No data matching current filters'
                } | Query: "{query}" | Threshold: {threshold}
              </div>
            </div>
            <HeatMap2
              grievances={grievances}
              className={'w-full h-full rounded-md'}
              getDistricts={getDistricts}
            />
          </div>
        </div>
      </div>

      {/* Spatial Search Link */}
      <div className="flex justify-center">
        <SpatialSearchLinkButton />
      </div>
    </div>
  );
}

export default Spatial;

const SpatialSearchLinkButton = () => {
  const [controller, dispatch] = useMaterialTailwindController();

  return (
    <Button
      color="green"
      className="h-[2.6rem] flex justify-center items-center gap-2"
      onClick={() => setOpenConfigurator(dispatch, true)}
    >
      Go to Advanced Spatial Search
      <ArrowUpRightIcon className="h-[1.2rem]" />
    </Button>
  )
}
