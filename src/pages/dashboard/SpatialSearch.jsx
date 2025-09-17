import { useFilter } from "@/context/FilterContext"
import { SearchFilters } from "."
import { basicQueryTypes, isValidBasicQueryType, isValidSpatialFilterType, onlySemanticQueryType } from "@/widgets/layout"
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2"
import EnhancedHeatmap from "@/widgets/maps/EnhancedHeatmap"
import LeafletBackground from "@/widgets/maps/LeafletBackground"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import mapService from "@/services/maps"
import grievanceService from "@/services/grievances"
import searchService from "@/services/searchService"
import GrievanceList from "@/widgets/grievance/list"
import EnhancedGrievanceResults from "@/widgets/grievance/EnhancedGrievanceResults"
import DetailedGrievanceModal from "@/widgets/grievance/DetailedGrievanceModal"
import { pageSize } from "@/helpers/env"
import { json2csv } from "json-2-csv"
import district_lat_long from "@/data/json/district_lat_long.json"
import { downloadData } from "@/helpers/download"
import { GlobeAltIcon, MapPinIcon, ChartBarIcon, MagnifyingGlassIcon, XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid"
import { formatDate } from "@/helpers/date"
import { Card, CardBody, Typography, Button, Input, Select, Option, Checkbox, Slider } from "@material-tailwind/react"
import { useTheme, useMaterialTailwindController } from "@/context"
import { MinistryAutocomplete, DateRangePicker, StateDistrictAutocomplete } from "@/pages/dashboard/CategoricalTree"

export const SpatialSearch = () => {
    const { filters, searching, startSearch, stopSearch, setFilters, pageno, setPageno } = useFilter()
    const [controller, dispatch] = useMaterialTailwindController()
    const { openSidenav, collapsedSidenav } = controller
    const [grievanceLength, setGrievanceLength] = useState(0)
    const [stateWiseGrievances, setStateWiseGrievances] = useState([])
    const [grievances, setGrievances] = useState([])
    const [total, setTotal] = useState(0)
    const [count, setCount] = useState(0)
    
    // Handle pagination changes properly
    const handlePageChange = (newPage) => {
        console.log('📄 Page change requested:', newPage);
        setPageno(newPage);
        // The SpatialDataDisplay component will automatically react to pageno change
    };
    const [noDataFound, setNoDataFound] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [focusDistrict, setFocusDistrict] = useState(undefined)
    const [showResults, setShowResults] = useState(false)
    const [selectedGrievance, setSelectedGrievance] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [showMapModal, setShowMapModal] = useState(false)
    const { isDark } = useTheme()
    const resultsRef = useRef(null)

    const getDistrictStats = () => {
        // Placeholder function for district stats
        return Promise.resolve()
    }

    const download = () => {
        // Placeholder function for download
        setDownloading(true)
        setTimeout(() => setDownloading(false), 1000)
    }

    // Scroll to results when data is loaded
    useEffect(() => {
        if (stateWiseGrievances.length > 0 && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                })
            }, 300)
        }
    }, [stateWiseGrievances])

    const initiateSearch = () => {
        setPageno(1)
        startSearch()
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Leaflet Map - Always visible */}
            <div className="absolute inset-0 w-full h-full z-0">
                <LeafletBackground />
            </div>

            {/* Hidden Data Component for functionality */}
            <div className="hidden">
                <SpatialDataDisplay 
                    updateGrievanceLength={setGrievanceLength} 
                    updateStateWiseGrievances={setStateWiseGrievances}
                    updateGrievances={setGrievances}
                    updateTotal={setTotal}
                    updateCount={setCount}
                />
            </div>

            {/* Direct Form Overlay with Background */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6">
                <div className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/50">
                    {/* Search Type and Input Row */}
                    <div className="flex gap-3 items-center mb-6">
                        <div className="w-32">
                            <SpatialSearchTypeSelector />
                        </div>
                        <div className="flex-1">
                            <SpatialSearchInput />
                        </div>
                        <div className="w-auto">
                            <SpatialSearchButton onSearch={() => setShowResults(true)} />
                        </div>
                    </div>

                    {/* Filters Grid - Enhanced Layout for Date Picker */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
                        {/* Date Range - Wider Column */}
                        <div className="lg:col-span-5">
                            <Typography variant="small" color="gray" className="font-semibold mb-2 text-gray-800">
                                Date Range
                            </Typography>
                            <Typography variant="small" color="gray" className="text-xs text-gray-600 mb-3">
                                Note: CDIS data is available from 2016-2024.
                            </Typography>
                            <div className="relative z-50">
                                <SpatialDateRangeInput />
                            </div>
                        </div>

                        {/* Ministry */}
                        <div className="lg:col-span-3">
                            <Typography variant="small" color="gray" className="font-semibold mb-2 text-gray-800">
                                Ministry
                            </Typography>
                            <div className="mt-5">
                                <SpatialMinistryFilter />
                            </div>
                        </div>

                        {/* State/District */}
                        <div className="lg:col-span-4">
                            <Typography variant="small" color="gray" className="font-semibold mb-2 text-gray-800">
                                State / District
                            </Typography>
                            <div className="mt-5">
                                <SpatialStateDistrictPicker />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="w-full sm:w-2/3">
                            <SpatialThresholdSlider />
                        </div>
                        <div className="flex items-center gap-2">
                            <SpatialClosedCheckbox />
                            <Typography variant="small" color="gray" className="text-gray-800 text-sm font-semibold">
                                Show closed grievances
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section - Only show when search is performed */}
            {showResults && (
                <div className="fixed inset-0 w-full h-full bg-white z-50 overflow-auto">
                    <div className="min-h-screen bg-gray-50 px-4 py-6" style={{
                        marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1280 ? 
                            (openSidenav ? (collapsedSidenav ? '96px' : '320px') : '0px') : '0px',
                        width: typeof window !== 'undefined' && window.innerWidth >= 1280 ? 
                            (openSidenav ? (collapsedSidenav ? 'calc(100vw - 96px)' : 'calc(100vw - 320px)') : '100vw') : '100vw'
                    }}>
                        {/* Navigation Controls */}
                        <div className="mb-6 flex items-center gap-3">
                            {/* Hamburger Menu Button */}
                             <Button
                                 onClick={() => {
                                     dispatch({ type: "OPEN_SIDENAV", value: !openSidenav });
                                 }}
                                 className="!bg-blue-600 !text-white hover:!bg-blue-700 !rounded-lg flex items-center gap-2 px-3 py-2 !shadow-none"
                                 size="sm"
                             >
                                 <Bars3Icon className="h-4 w-4" />
                             </Button>
                            
                            {/* Back Button */}
                            <Button
                                onClick={() => setShowResults(false)}
                                className="!bg-gray-600 !text-white hover:!bg-gray-700 !rounded-lg flex items-center gap-2 px-4 py-2 !shadow-none"
                                size="sm"
                            >
                                <XMarkIcon className="h-4 w-4" />
                                Back to Search
                            </Button>
                        </div>

                        <div className="container mx-auto max-w-full px-2 sm:px-4">
                              <div className="w-full">
                                  {/* Data Results - Full Width */}
                                  <Card className="w-full bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden">
                                      <CardBody className="p-3 sm:p-6">
                                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                                              <div className="flex items-center gap-2 sm:gap-3">
                                                  <div className="p-2 sm:p-3 rounded-lg bg-green-100">
                                                      <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                                  </div>
                                                  <div>
                                                      <Typography variant="h6" className="font-semibold text-blue-gray-800 text-sm sm:text-base">
                                                          Grievance Results
                                                      </Typography>
                                                      <Typography variant="small" color="gray" className="text-xs sm:text-sm">
                                                          {total?.toLocaleString()} records found
                                                      </Typography>
                                                  </div>
                                              </div>
                                              
                                              {/* View Map Button */}
                                              <Button
                                                  size="sm"
                                                  variant="outlined"
                                                  className="flex items-center gap-2 !border-blue-500 !text-blue-600 hover:!bg-blue-50"
                                                  onClick={() => {
                                                      // Collapse sidebar if open for better map view
                                                      if (openSidenav) {
                                                          dispatch({ type: "OPEN_SIDENAV", value: false });
                                                      }
                                                      setShowMapModal(true);
                                                  }}
                                              >
                                                  <MapPinIcon className="h-4 w-4" />
                                                  View Map
                                              </Button>
                                          </div>
                                          
                                          {/* Enhanced Grievance Results */}
                                          <EnhancedGrievanceResults
                                              grievances={grievances}
                                              loading={searching}
                                              total={total}
                                              count={count}
                                              pageno={pageno}
                                              onPageChange={handlePageChange}
                                              onViewDetails={(grievance) => {
                                                  console.log('View details for:', grievance);
                                                  setSelectedGrievance(grievance);
                                                  setModalOpen(true);
                                              }}
                                              onDownload={download}
                                              downloading={downloading}
                                          />
                                      </CardBody>
                                  </Card>
                             </div>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Map Modal */}
            {showMapModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <Typography variant="h6" className="font-semibold text-blue-gray-800">
                                        India Geographic Distribution
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Interactive State-wise Heatmap
                                    </Typography>
                                </div>
                            </div>
                            <Button
                                variant="text"
                                size="sm"
                                onClick={() => setShowMapModal(false)}
                                className="!p-2 !min-w-0"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex-1 p-4">
                            <div className="h-full rounded-lg overflow-hidden border border-gray-200">
                                <HeatMap2
                                    grievances={stateWiseGrievances}
                                    className="w-full h-full"
                                    getDistricts={getDistrictStats}
                                    focusDistrict={focusDistrict}
                                    noFocus={false}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                        <span className="text-gray-700 font-medium">High (500)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                        <span className="text-gray-700 font-medium">Medium (100-500)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                         <span className="text-gray-700 font-medium">Low (&lt;100)</span>
                                     </div>
                                </div>
                                <Typography variant="small" color="gray">
                                    States: {stateWiseGrievances.length}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Detailed Grievance Modal */}
             {modalOpen && selectedGrievance && (
                  <DetailedGrievanceModal
                      grievance={selectedGrievance}
                      open={modalOpen}
                      onClose={() => {
                          setModalOpen(false);
                          setSelectedGrievance(null);
                      }}
                  />
              )}
        </div>
    )
}

export const SpatialDataDisplay = ({
    updateGrievanceLength = () => '',
    updateStateWiseGrievances = () => '',
    updateGrievances = () => '',
    updateTotal = () => '',
    updateCount = () => ''
}) => {
    const { filters, searching, startSearch, tempFilters, stopSearch, setFilters, pageno, setPageno } = useFilter()
    const { isDark } = useTheme()
    const listingRef = useRef(null)
    const [stateWiseGrievances, setStateWiseGrievances] = useState([])
    const [grievances, setGrievances] = useState([])
    const [count, setCount] = useState(0)
    const [total, setTotal] = useState(0)
    const [noDataFound, setNoDataFound] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [isLocallySearching, setIsLocallySearching] = useState(false)
    const [selectedState, setSelectedState] = useState(undefined)
    const [preventHeatmapUpdate, setPreventHeatmapUpdate] = useState(false)
    const [focusedDistrict, setFocusedDistrict] = useState(undefined)

    const getDistrictStats = stateName =>
        new Promise(async resolve => {
            const filtersWithState = {
                ...filters,
                state: stateName,
                district: filters.district == focusedDistrict ? 'All' : filters.district
            }

            // setFilters(filtersWithState)

            setPreventHeatmapUpdate(true)

            setSelectedState(stateName)

            setPageno(1)

            startSearch(filtersWithState)

            const districts = (await mapService.districtWiseCounts(filtersWithState, pageno))
                ?.data?.district_wise_distribution
                ?? {}

            resolve(
                Object.entries(districts)
                    .map(([district, count]) => ({
                        district,
                        count,
                        ...getDistrictLatLong(district, stateName)
                    }))
                ?? []
            )
        })

    const focusDistrict = newDistrict => {
        if (searching)
            return false

        setFocusedDistrict(newDistrict)

        setPageno(1)

        setPreventHeatmapUpdate(true)

        // setFilters({
        //     ...filters,
        //     district: newDistrict
        // })

        startSearch({
            ...filters,
            state: selectedState,
            district: newDistrict
        })

        return true
    }

    const listingTitle = useMemo(() => `Searched Grievances ${selectedState ? `for ${selectedState}` : ''} ${focusedDistrict ? ` -> ${focusedDistrict}` : ''}`, [selectedState, focusedDistrict])

    const download = async () => {
        setDownloading(true)

        try {
            let data;
            
            // Check if we have a search query to use the search API
            if (filters.query && filters.query.trim().length > 0) {
                console.log('🔍 Using search API for download with query:', filters.query);
                
                // Use search API for download with all filters
                const searchParams = {
                    query: filters.query,
                    value: parseInt(filters.type) || 1,
                    skiprecord: 0,
                    size: 10000, // Get all results for download
                    threshold: filters.threshold || 1.5,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    state: filters.state && filters.state !== 'All' ? filters.state : null,
                    district: filters.district && filters.district !== 'All' ? filters.district : null,
                    ministry: filters.ministry && filters.ministry !== 'All' ? filters.ministry : null,
                    all_record: 1,
                    page_req: 0
                };
                
                const searchResult = await searchService.searchGrievances(searchParams);
                
                if (searchResult.success) {
                    // No client-side filtering for download - API handles all filters
                    console.log('📥 API returned', searchResult.grievances.length, 'filtered results for download');
                    
                    // Convert search results to CSV format
                    const csvData = searchResult.grievances.map(grievance => ({
                        registration_no: grievance.registrationNo || grievance.id,
                        state: grievance.stateName,
                        district: grievance.districtName,
                        recvd_date: grievance.complaintRegDate,
                        closing_date: grievance.closingDate,
                        name: grievance.complainantName,
                        ministry: grievance.ministryName,
                        complaint: grievance.complaintDetails,
                        status: grievance.complaintStatus
                    }));
                    
                    // Generate CSV and download
                    const csv = await json2csv(csvData);
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `search_results_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                } else {
                    throw new Error(searchResult.error || 'Search API failed');
                }
            } else {
                // Use original grievance service for non-search queries
                data = (await grievanceService.queryGrievances({
                    ...filters,
                    download_req: 1,
                    size: 10000
                }, pageno)).data;
                
                downloadData(data?.filename);
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download data. Please try again.');
        }

        setDownloading(false)
    }

    const getGrievances = async (temp = null, currentPage = pageno) => {
        try {
            console.log('📄 Fetching page:', currentPage, 'with filters:', temp ?? tempFilters ?? filters);
            
            // Create filters with current page number
            const requestFilters = {
                ...(temp ?? tempFilters ?? filters),
                pageno: currentPage
            };
            
            let response, data;
            
            // Check if we have a search query to use the search API
            if (requestFilters.query && requestFilters.query.trim().length > 0) {
                console.log('🔍 Using search API with query:', requestFilters.query);
                
                // Calculate pagination parameters for search API
                const pageSize = 20; // Default page size
                const skiprecord = (currentPage - 1) * pageSize;
                
                // Use search API with only supported parameters
                const searchParams = {
                    query: requestFilters.query,
                    value: parseInt(requestFilters.type) || 1, // Default to semantic search
                    skiprecord: skiprecord,
                    size: pageSize,
                    threshold: requestFilters.threshold || 1.2
                };
                
                console.log('🔍 Search API params:', searchParams);
                
                const searchResult = await searchService.searchGrievances(searchParams);
                
                if (searchResult.success) {
                    // No client-side filtering - API handles all filters
                    console.log('✅ API returned', searchResult.grievances.length, 'filtered results');
                    
                    // Transform search API response to match expected format
                    data = {
                        data: searchResult.grievances,
                        count: searchResult.grievances.length,
                        total: searchResult.totalCount,
                        total_count: searchResult.totalCount
                    };
                    response = { data, status: 200 };
                } else {
                    throw new Error(searchResult.error || 'Search API failed');
                }
            } else {
                // Use original grievance service for non-search queries
                response = await grievanceService.queryGrievances(requestFilters, currentPage);
                data = response.data;
            }
            
            console.log('🔍 Raw API response:', {
                responseStatus: response.status,
                dataStructure: data,
                dataKeys: Object.keys(data || {}),
                dataArray: data.data,
                dataArrayType: Array.isArray(data.data),
                dataArrayLength: data.data?.length
            });
            
            let list = [];
            
            console.log('🔍 CRITICAL: Raw data.data analysis:', {
                dataData: data.data,
                dataDataType: typeof data.data,
                isArray: Array.isArray(data.data),
                dataDataLength: data.data?.length,
                firstElement: data.data?.[0],
                firstElementType: typeof data.data?.[0],
                isFirstElementEmptyObject: data.data?.[0] === '{}'
            });
            
            if (data.data && Array.isArray(data.data)) {
                console.log('🔍 Processing array data:', {
                    arrayLength: data.data.length,
                    firstElement: data.data[0],
                    isFirstElementEmptyString: data.data[0] === '{}'
                });
                list = data.data[0] === '{}' ? [] : data.data;
            } else if (data.data && typeof data.data === 'object') {
                console.log('🔍 Processing object data:', data.data);
                list = [data.data];
            }
            
            console.log('🔍 CRITICAL: Final processed list:', {
                list: list,
                listLength: list?.length,
                listType: typeof list,
                isListArray: Array.isArray(list),
                sampleListItem: list?.[0]
            });
            
            console.log('📋 Processed list:', {
                originalData: data.data,
                processedList: list,
                listLength: list?.length,
                listType: Array.isArray(list)
            });

            console.log('📋 Received data for page', currentPage, ':', {
                listLength: list?.length,
                count: data.count,
                total: data.total
            });
            
            // Update state with received data
            console.log('🔄 Setting state with processed data:', {
                listToSet: list,
                listLength: list?.length,
                dataCount: data.count,
                dataTotal: data.total,
                dataTotalCount: data.total_count
            });
            
            setGrievances(list);
            setCount(data.count || list?.length || 0);
            
            // Set total from API response for pagination
            const totalRecords = data.total || data.total_count || data.count || list?.length || 0;
            setTotal(totalRecords);
            
            console.log('✅ State updated successfully:', {
                grievancesSet: list?.length,
                countSet: data.count || list?.length || 0,
                totalSet: totalRecords
            });
            
            // Force update grievance length for parent component
            updateGrievanceLength(list?.length || 0);
            updateGrievances(list || []);
            updateCount(data.count || list?.length || 0);
            updateTotal(totalRecords);
            
            console.log('📊 Pagination setup:', {
                currentPageRecords: list?.length,
                totalRecords: totalRecords,
                currentPage: currentPage,
                recordsPerPage: 20,
                totalPages: Math.ceil(totalRecords / 20)
            });
            
            console.log('📊 Updated state:', {
                grievancesLength: list?.length,
                count: data.count || list?.length || 0,
                total: data.total || data.count || list?.length || 0
            });

            // Sort grievances by received date (newest first)
            if (list && Array.isArray(list) && list.length > 0) {
                list = list.sort((a, b) => {
                    // Try different date fields
                    const dateA = new Date(a.recvd_date || a.received_date || a.date || '1970-01-01');
                    const dateB = new Date(b.recvd_date || b.received_date || b.date || '1970-01-01');
                    
                    // Sort in descending order (newest first)
                    return dateB.getTime() - dateA.getTime();
                });
                
                console.log('📅 Grievance list sorted by date (newest first)');
            }

            // Only fetch state distribution on first page or when filters change
            if (!preventHeatmapUpdate && currentPage === 1) {
                console.log('🗺️ Fetching state-wise distribution for choropleth map');
                const stateDistribution = data.count > 0 
                    ? (await mapService.stateWiseCounts(requestFilters, 1)).data?.state_wise_distribution
                    : {};
                
                console.log('📊 State distribution received:', stateDistribution);
                const stateWiseData = createStateWiseArray(stateDistribution);
                setStateWiseGrievances(stateWiseData);

                // Auto-select the state with highest grievance count
                if (stateWiseData.length > 0) {
                    const topState = stateWiseData.reduce((prev, current) => 
                        (prev.count > current.count) ? prev : current
                    );
                    
                    console.log('🎯 Auto-selecting top state:', topState.state, 'with', topState.count, 'grievances');
                    
                    // Don't set selected state automatically as it might interfere with user interaction
                    // setSelectedState(topState.state);
                } else {
                    setSelectedState(undefined);
                }
            }
            else
                setPreventHeatmapUpdate(false)

            stopSearch()

            if (!list || list.length == 0) {
                toast.warn("No data found!")
            }

            setGrievances(list)
            setCount(data.count || list.length)
            // Ensure total is always a number, not an object
            const totalCount = typeof data.total_count === 'object' 
                ? (data.total_count?.total_count || data.total_count?.count || data.count || list.length)
                : (data.total_count || data.count || list.length);
            setTotal(totalCount)
            setNoDataFound((data.count || list.length) == 0)

            console.log('📋 Grievance list updated:', {
                listLength: list.length,
                count: data.count,
                total: data.total_count,
                finalCount: data.count || list.length,
                finalTotal: totalCount
            });

            listingRef.current.scrollIntoView({
                behavior: 'smooth'
            })
        } catch {
            toast("There was an error. Please try again.", { type: "error" })
            stopSearch()
        }
    }

    useEffect(() => {
        if (isLocallySearching && filters.query && filters.query.trim().length > 0) {
            getGrievances()
        } else if (isLocallySearching && (!filters.query || filters.query.trim().length === 0)) {
            toast.warn("Enter the text to search")
            stopSearch()
        }
    }, [isLocallySearching])

    // Updating local search state to prevent multiple calls at initial load
    useEffect(() => {
        setIsLocallySearching(searching)
    }, [searching])

    // Handle pagination changes
    useEffect(() => {
        if (filters.query && filters.query.trim().length > 0 && pageno > 1) {
            console.log('📄 Page changed to:', pageno, 'triggering new search');
            getGrievances();
        }
    }, [pageno]);

    useEffect(() => {
        if (filters.query && filters.query.trim().length > 0) {
            startSearch()
        }
    }, [pageno])

    useEffect(() => {
        updateGrievanceLength(grievances.length)
    }, [grievances])

    useEffect(() => {
        updateStateWiseGrievances(stateWiseGrievances)
    }, [stateWiseGrievances])

    useEffect(() => {
        updateGrievances(grievances)
    }, [grievances])

    useEffect(() => {
        updateTotal(total)
    }, [total])

    useEffect(() => {
        updateCount(count)
    }, [count])

    // Handle pagination changes
    useEffect(() => {
        if (pageno > 1) {
            console.log('📄 Pagination changed to page:', pageno)
            getGrievances(null, pageno)
        }
    }, [pageno])

    // Default heatmap data for initial display
    const defaultHeatmapData = [
        { state: 'maharashtra', count: 890 },
        { state: 'uttar pradesh', count: 780 },
        { state: 'karnataka', count: 650 },
        { state: 'tamil nadu', count: 520 },
        { state: 'gujarat', count: 410 },
        { state: 'west bengal', count: 350 },
        { state: 'rajasthan', count: 280 },
        { state: 'andhra pradesh', count: 240 }
    ]

    const displayData = stateWiseGrievances.length > 0 ? stateWiseGrievances : defaultHeatmapData

    return (
        <div className="w-full h-full" ref={listingRef}>
            <EnhancedHeatmap
                grievances={displayData}
                className="w-full h-full rounded-lg"
                getDistricts={getDistrictStats}
                loading={searching}
            />
        </div>
    )
}

export const createStateWiseArray = object => {
    if (!object || typeof object !== 'object') {
        console.log('⚠️ Invalid state distribution object:', object);
        return [];
    }
    
    const stateArray = Object.keys(object)
        .filter(state => state && state !== 'null' && state !== 'undefined')
        .map(state => {
            const normalizedState = state?.toLowerCase()?.trim();
            const count = parseInt(object[state]) || 0;
            
            console.log('🗺️ Mapping state:', state, '→', normalizedState, 'with count:', count);
            
            return {
                state: normalizedState,
                count: count
            };
        })
        .filter(item => item.count > 0); // Only include states with grievances
    
    console.log('📊 Final state-wise array for choropleth:', stateArray);
    return stateArray;
}

const createStateDistrictTree = grievances => grievances.reduce((states, grievance) => {
    let stateIndex = states.findIndex(state => state.name == grievance.state)

    if (stateIndex == -1) {
        stateIndex = states.length
        states.push({
            name: grievance.state,
            grievances: [],
            districts: []
        })
    }

    let districtIndex = states[stateIndex].districts.findIndex(district => district.name == grievance.district)

    if (districtIndex == -1) {
        districtIndex = states[stateIndex].districts.length
        states[stateIndex].districts.push({
            name: grievance.district,
            grievances: []
        })
    }

    states[stateIndex].grievances.push(grievance)
    states[stateIndex].districts[districtIndex].grievances.push(grievance)

    return states
}, [])

const csvColumnNames = [
    {
        field: 'registration_no',
        title: "Registration No."
    },
    {
        field: 'state',
        title: "State"
    },
    {
        field: 'district',
        title: "District"
    },
    {
        field: 'recvd_date',
        title: "Received Date"
    },
    {
        field: 'closing_date',
        title: "Closing Date"
    },
    {
        field: 'name',
        title: "Name"
    },
    {
        field: 'ministry',
        title: "Ministry"
    }
]

export const downloadCSV = async (data, columns = [], filters = {}, additionalData = null, title = "Grievances") => {
    const csvText = json2csv(data, { keys: columns.length == 0 ? undefined : columns })

    const blob = new Blob([csvText], { type: 'text/csv' })

    const url = window.URL.createObjectURL(blob)

    const filterValues = Object.values(filters)

    const filename = 'IGMS2_' +
        title + '_' +
        formatDate(new Date(), 'd_MMM_yyyy') +
        (additionalData ? '_' + additionalData : '') +
        (filterValues.length > 0 ? '_' : '') +
        filterValues.join('_') +
        '.csv'

    const a = document.createElement('a')

    a.setAttribute('href', url)

    a.setAttribute('download', filename)

    a.click()
}

const getDistrictLatLong = (district, state = null) => {
    district = district.toLowerCase().trim()
    state = state.toLowerCase().trim()

    let latLongData =
        district_lat_long
            .find(districtObject => // Checking for simillarity in district and state
                districtObject.district == district
                && districtObject.state == state
            )
        ?? district_lat_long
            .find(districtObject => // Checking for simillarity in district name only if the above condition fails
                districtObject.district == district
            )

    return {
        latitude: latLongData?.latitude,
        longitude: latLongData?.longitude
    }
}

// Custom Ministry Filter Component for Spatial Search
const SpatialMinistryFilter = () => {
    const { filters, setFilters } = useFilter()
    const { isDark } = useTheme()
    
    const [selectedMinistry, setSelectedMinistry] = useState({
        text: filters.ministry === 'All' ? '' : filters.ministry,
        value: filters.ministry
    })

    const updateSelectedMinistry = (selection) => {
        setFilters({
            ...filters,
            ministry: selection?.value || 'All'
        })
        setSelectedMinistry(selection || { text: '', value: 'All' })
    }

    // Update local state when filter context changes
    useEffect(() => {
        setSelectedMinistry({
            text: filters.ministry === 'All' ? '' : filters.ministry,
            value: filters.ministry
        })
    }, [filters.ministry])

    return (
        <div className="relative z-20">
            <MinistryAutocomplete
                ministry={selectedMinistry}
                setMinistry={updateSelectedMinistry}
                className="!border-gray-300 !rounded-lg !bg-white !text-gray-700 z-20"
            />
        </div>
    )
}

// Search Type Selector Component
const SpatialSearchTypeSelector = () => {
    const { filters, setFilters } = useFilter()

    return (
        <div className="relative">
            <Typography variant="small" className="text-gray-700 font-semibold mb-2 block">
                Search Type
            </Typography>
            <Select
                value={filters.type}
                onChange={(value) => setFilters({ ...filters, type: value })}
                className="!border-gray-300 !rounded-lg !bg-white !text-gray-700 !h-11"
                labelProps={{
                    className: "before:content-none after:content-none"
                }}
                containerProps={{
                    className: "!min-w-0"
                }}
            >
                <Option value="1">Semantic</Option>
                <Option value="2">Keyword</Option>
                <Option value="3">Hybrid</Option>
            </Select>
        </div>
    )
}

// Search Input Component
const SpatialSearchInput = () => {
    const { filters, setFilters } = useFilter()
    const { isDark } = useTheme()

    return (
        <div className="flex-1">
            <Typography variant="small" className="text-gray-700 font-semibold mb-2 block">
                Search Query
            </Typography>
            <Input
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                type="text"
                placeholder="Enter Natural Language Query..."
                className="!border-gray-300 focus:!border-blue-500 !rounded-lg !bg-white !text-gray-900 placeholder:!text-gray-500 !h-11"
                labelProps={{
                    className: "before:content-none after:content-none"
                }}
                containerProps={{
                    className: "!min-w-0"
                }}
            />
        </div>
    )
}

// Search Button Component
const SpatialSearchButton = ({ onSearch }) => {
    const { filters, searching, startSearch, setPageno } = useFilter()
    const { isDark } = useTheme()

    const handleSearch = () => {
        setPageno(1)
        startSearch()
        if (onSearch) onSearch()
    }

    return (
        <Button 
            onClick={handleSearch}
            disabled={searching || !filters.query}
            className="!bg-green-600 !text-white hover:!bg-green-700 !rounded-lg flex items-center gap-2 px-6 py-3 !shadow-none uppercase !font-medium"
            size="md"
        >
            <MagnifyingGlassIcon className="h-4 w-4" />
            {searching ? 'Searching...' : 'Search'}
        </Button>
    )
}

// Simple Date Range Input Component
const SpatialDateRangeInput = () => {
    const { filters, setFilters } = useFilter()
    const { isDark } = useTheme()
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null
    })

    const updateDateRange = (range) => {
        console.log('📅 Date range selected:', range)
        setFilters({
            ...filters,
            startDate: range.startDate,
            endDate: range.endDate
        })
        setDateRange(range)
    }

    return (
        <div className="w-full relative z-[9999] min-h-[400px]">
            <div className={`border rounded-lg shadow-lg overflow-visible ${
                isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}>
                <DateRangePicker
                    value={dateRange}
                    onChange={updateDateRange}
                    showShortcuts={true}
                    showFooter={true}
                    placeholder="Select Date Range"
                    className={`w-full p-3 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'
                    }`}
                    containerClassName="w-full overflow-visible"
                    inputClassName={`w-full p-3 text-sm border-0 rounded-lg focus:outline-none ${
                        isDark ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-700 placeholder-gray-500'
                    }`}
                    popoverDirection="down"
                    style={{
                        '--tw-bg-opacity': '1',
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        color: isDark ? '#ffffff' : '#374151',
                        borderColor: isDark ? '#4b5563' : '#d1d5db'
                    }}
                />
            </div>
            <style jsx global>{`
                .react-datepicker {
                    background-color: ${isDark ? '#1f2937' : '#ffffff'} !important;
                    border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
                    border-radius: 8px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    z-index: 9999 !important;
                    position: absolute !important;
                    top: 100% !important;
                    left: 0 !important;
                    width: 100% !important;
                    min-width: 600px !important;
                    overflow: visible !important;
                }
                .react-datepicker__header {
                    background-color: ${isDark ? '#374151' : '#f9fafb'} !important;
                    border-bottom: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'} !important;
                    color: ${isDark ? '#ffffff' : '#111827'} !important;
                }
                .react-datepicker__day {
                    color: ${isDark ? '#ffffff' : '#111827'} !important;
                }
                .react-datepicker__day:hover {
                    background-color: ${isDark ? '#4b5563' : '#e5e7eb'} !important;
                }
                .react-datepicker__day--selected {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                .react-datepicker__day--in-range {
                    background-color: ${isDark ? '#1e40af' : '#dbeafe'} !important;
                    color: ${isDark ? '#ffffff' : '#1e40af'} !important;
                }
                .react-datepicker__month-container {
                    background-color: ${isDark ? '#1f2937' : '#ffffff'} !important;
                }
                .react-datepicker__navigation {
                    border: none !important;
                }
                .react-datepicker__navigation-icon::before {
                    border-color: ${isDark ? '#ffffff' : '#374151'} !important;
                }
                .react-datepicker__current-month {
                    color: ${isDark ? '#ffffff' : '#111827'} !important;
                }
                .react-datepicker__day-name {
                    color: ${isDark ? '#d1d5db' : '#6b7280'} !important;
                }
                .react-datepicker-popper {
                    z-index: 9999 !important;
                }
                
                /* Scrollable Shortcuts Styling */
                .react-datepicker__shortcuts {
                    max-height: 300px !important;
                    overflow-y: auto !important;
                    padding: 8px !important;
                    background-color: ${isDark ? '#1f2937' : '#ffffff'} !important;
                    border-right: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'} !important;
                    scrollbar-width: thin !important;
                    scrollbar-color: ${isDark ? '#4b5563 #1f2937' : '#d1d5db #ffffff'} !important;
                }
                
                .react-datepicker__shortcuts::-webkit-scrollbar {
                    width: 6px !important;
                }
                
                .react-datepicker__shortcuts::-webkit-scrollbar-track {
                    background: ${isDark ? '#1f2937' : '#f9fafb'} !important;
                    border-radius: 3px !important;
                }
                
                .react-datepicker__shortcuts::-webkit-scrollbar-thumb {
                    background: ${isDark ? '#4b5563' : '#d1d5db'} !important;
                    border-radius: 3px !important;
                }
                
                .react-datepicker__shortcuts::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? '#6b7280' : '#9ca3af'} !important;
                }
                
                .react-datepicker__shortcut {
                    padding: 8px 12px !important;
                    margin: 2px 0 !important;
                    border-radius: 6px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    color: ${isDark ? '#d1d5db' : '#374151'} !important;
                    font-size: 14px !important;
                    white-space: nowrap !important;
                }
                
                .react-datepicker__shortcut:hover {
                    background-color: ${isDark ? '#374151' : '#f3f4f6'} !important;
                    color: ${isDark ? '#ffffff' : '#111827'} !important;
                }
                
                .react-datepicker__shortcut--selected {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                
                .react-datepicker__shortcuts-container {
                    min-width: 180px !important;
                    max-width: 200px !important;
                }
            `}</style>
        </div>
    )
}

// State District Picker Component
const SpatialStateDistrictPicker = () => {
    const { filters, setFilters } = useFilter()
    const [stateDistrict, setStateDistrict] = useState({
        text: filters.state === 'All' ? '' : filters.state,
        values: {
            state: filters.state,
            district: filters.district
        }
    })

    const updateStateDistrict = (newStateDistrict) => {
        if (newStateDistrict && newStateDistrict.values) {
            setFilters({
                ...filters,
                state: newStateDistrict.values.state,
                district: newStateDistrict.values.district
            })
        } else {
            setFilters({
                ...filters,
                state: 'All',
                district: 'All'
            })
        }
        setStateDistrict(newStateDistrict)
    }

    useEffect(() => {
        setStateDistrict({
            text: filters.state === 'All' ? '' : filters.state,
            values: {
                state: filters.state,
                district: filters.district
            }
        })
    }, [filters.state, filters.district])

    return (
        <div className="relative z-30">
            <StateDistrictAutocomplete
                stateDistrict={stateDistrict}
                setStateDistrict={updateStateDistrict}
                className="!border-gray-300 !rounded-lg !bg-white !text-gray-700 z-30"
            />
        </div>
    )
}

// Threshold Slider Component
const SpatialThresholdSlider = () => {
    const { filters, setFilters } = useFilter()
    const { isDark } = useTheme()

    return (
        <div>
            <Typography variant="small" color="gray" className="font-medium mb-2">
                Relevance Threshold
            </Typography>
            <div className="px-2">
                <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={filters.threshold || 1.2}
                    onChange={(e) => setFilters({ ...filters, threshold: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Less Relevant</span>
                    <span className="text-blue-600 font-medium">Current: {filters.threshold || 1.2}</span>
                    <span>More Relevant</span>
                </div>
            </div>
        </div>
    )
}

// Closed Checkbox Component
const SpatialClosedCheckbox = () => {
    const { filters, setFilters } = useFilter()

    return (
        <Checkbox
            id="closed"
            checked={filters.all_record === 1}
            onChange={(e) => setFilters({ ...filters, all_record: e.target.checked ? 1 : 0 })}
            color="blue"
            className="!rounded !border-2 !border-gray-300"
        />
    )
}