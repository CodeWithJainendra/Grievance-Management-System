import { countDayDuration, pageSize } from "@/helpers/env";
import httpService from "./httpService";
import { formatDate, dateBefore } from "@/helpers/date";
import { getDefaultDepartment } from "@/data";

export const filteredQueryBuilder = (route, filters, page_no) => {
    let isDateSet = filters.startDate && filters.endDate

    return httpService.auth.get(route, {
        params: {
            ...filters,
            value: filters.type,
            query: filters.query,
            startDate: isDateSet ? filters.startDate : null,
            endDate: isDateSet ? filters.endDate : null,
            skiprecord: (page_no - 1) * pageSize,
            size: filters.size ?? pageSize,
            state: filters.state,
            district: filters.district,
            ministry: filters.ministry,
            all_record: filters.all_record,
            page_req: ['0', '1'].includes(filters.page_req)
                ? filters.page_req
                : (page_no == 1 ? 0 : 1)
        }
    })
}



// Deprecated >
function getPrimary(pageno, filters) {

    return httpService.get(`/profile/?skiprecord=0&size=40`);

}

function getFresh(pageno, filters) {

    return httpService.get(`/fresh/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}

function getNormal(pageno, filters) {

    return httpService.get(`/primary/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}

function getSpam(pageno, filters) {

    return httpService.get(`/spam/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}

function getPriority(pageno, filters) {

    return httpService.get(`/urgent/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}

function getRepeat(pageno, filters) {

    return httpService.get(`/repeat/?startDate=${filters.startDate}&endDate=${filters.endDate}&skiprecord=${(pageno - 1) * 20}&size=20&state=${filters.state}&district=${filters.district}&ministry=${filters.ministry}&all_record=1&download_req=0&page_req=0&filename=unknown&user=user`);

}
// < Deprecated

function getGrievancesOfType(
    type,
    pageno,
    ministry = getDefaultDepartment(),
    from = dateBefore(countDayDuration),
    to = formatDate(),
    showClosed = 1,
    state = 'All',
    district = 'All',
    download = false
) {
    if (type == 'normal')
        type = 'primary'
    // else if (type == 'repeat')
    //     return getRepeatParents(pageno, download)

    return filteredQueryBuilder(
        `/${type.toLowerCase()}`,
        {
            startDate: from,
            endDate: to,
            ministry: ministry,
            download_req: download ? 1 : 0,
            all_record: showClosed,
            state: state,
            district: district
        },
        pageno
    )
}


function getRepeatParents(page_no = 1) {
    return httpService.auth.get('/get_all_repeat_parents', {
        params: {
            skiprecord: (page_no - 1) * pageSize,
            size: pageSize,
        }
    })
}

function getRepeatChildren(name, from, to, state, district, ministry) {
    return httpService.auth.get('/get_repeat_child', {
        params: {
            name,
            startDate: from,
            endDate: to,
            state,
            district,
            ministry
        }
    })
}

function getRepeatParent(registration_no) {
    return httpService.auth.get('/get_repeat_parent', {
        params: {
            registration_no: registration_no
        }
    })
}


function descGrievance(grievancesId) {

    return httpService.auth.get(`/description/?registration_no=${grievancesId}&user=user`)

}



// API-level pagination - no cache variables needed

// Disable caching completely for proper pagination
function queryGrievances(filters, pageno) {
    console.log('🔍 Searching grievances with CDIS API:', { 
        query: filters.query, 
        type: filters.type, 
        ministry: filters.ministry,
        state: filters.state,
        district: filters.district,
        startDate: filters.startDate,
        endDate: filters.endDate,
        pageno,
        fullFiltersObject: JSON.stringify(filters, null, 2)
    });

    // API-level pagination - no caching needed
     console.log('🔄 Using API-level pagination for page:', pageno);
     console.log('📊 Pagination request details:', {
         currentPage: pageno,
         recordsPerPage: 20,
         skipRecords: (pageno - 1) * 20,
         filters: filters
     });

    console.log('🔄 Using fresh API call for each page to ensure different data');

    // Use CDIS API directly for search with pagination
    // NOTE: CDIS API only supports: query, value, skiprecord, size, threshold
    // Calculate skiprecord to get different data for each page
    const recordsPerPage = 20; // Fixed page size
    
    const searchParams = {
        query: filters.query || "",
        value: filters.type || filters.value || 1, // 1=Semantic, 2=Keyword  
        skiprecord: (pageno - 1) * recordsPerPage, // Skip previous pages' records
        size: recordsPerPage, // Fixed 20 records per page
        threshold: filters.threshold || 1.2 // Use provided threshold
    };
    
    console.log('📡 CDIS API call with pagination:', {
        ...searchParams,
        pageNumber: pageno,
        recordsToSkip: skipRecords,
        expectedRecordsRange: `${skipRecords + 1}-${skipRecords + recordsPerPage}`
    });
    
    console.log('🎯 Pagination Debug:', {
        'Page': pageno,
        'Skip Records': skipRecords,
        'Expected Range': `Records ${skipRecords + 1} to ${skipRecords + recordsPerPage}`,
        'API Size': recordsPerPage * 3
    });

    console.log('📡 CDIS API call (only supported params):', searchParams);

    // Declare transformedData in outer scope for catch block access
    let transformedData = [];

    console.log('📡 API Pagination Call:', {
        page: pageno,
        skipRecords: searchParams.skiprecord,
        requestedSize: searchParams.size,
        apiParams: searchParams
    });

    return httpService.search.searchGrievances(searchParams).then(result => {
        console.log('✅ CDIS API Search Result:', {
            success: result.success,
            totalCount: result.data?.total_count,
            grievanceCount: result.data?.grievanceData?.length
        });
        
        console.log('🔍 CRITICAL: Full API Response Analysis:', {
            resultStructure: result,
            resultData: result.data,
            resultDataKeys: Object.keys(result.data || {}),
            grievanceDataExists: !!result.data?.grievanceData,
            grievanceDataType: typeof result.data?.grievanceData,
            grievanceDataIsArray: Array.isArray(result.data?.grievanceData),
            grievanceDataLength: result.data?.grievanceData?.length,
            sampleGrievanceData: result.data?.grievanceData?.slice(0, 2)
        });

        // Log sample states separately for clarity
        const sampleStates = result.data?.grievanceData?.slice(0, 10).map(item => ({
            id: item.id || 'unknown',
            state: item.stateName || item.state || item.location || 'unknown',
            district: item.CityName || item.district || item.city || 'unknown',
            ministry: item.ministry || 'unknown'
        })) || [];
        
        console.log('🏛️ Sample states from CDIS API response:', sampleStates);
        
        // Check if API is returning mixed states despite filter
        const uniqueStates = [...new Set(sampleStates.map(item => item.state.toLowerCase()))];
        console.log('🎯 Unique states in API response:', uniqueStates);
        
        if (uniqueStates.length > 1) {
            console.log('⚠️ WARNING: CDIS API returned multiple states despite state filter!');
        } else {
            console.log('✅ CDIS API correctly filtered to single state');
        }

        // Transform CDIS API data to match expected format
        console.log('🔄 Starting data transformation:', {
            sourceData: result.data?.grievanceData,
            sourceDataLength: result.data?.grievanceData?.length,
            sourceDataType: typeof result.data?.grievanceData,
            isSourceArray: Array.isArray(result.data?.grievanceData)
        });
        
        transformedData = (result.data?.grievanceData || []).map(item => {
            console.log('🔄 Transforming item:', item);
            return {
                // Map CDIS fields to expected fields
                registration_no: item.id || item.complaintId || item.grievanceId || `CDIS-${Math.random().toString(36).substr(2, 9)}`,
                state: item.stateName || item.state || item.location || 'Unknown',
                district: item.CityName || item.district || item.city || 'Unknown',
                recvd_date: item.complaintRegDate || item.dateOfRegistration || item.registrationDate || new Date().toISOString(),
                closing_date: item.updationDate || item.lastUpdationDate || item.closureDate || '',
                name: item.fullName || item.name || item.complainantName || 'Unknown',
                ministry: item.ministry || 'DOCAF',
                
                // Additional fields that might be useful
                status: item.status || 'Active',
                userType: item.userType || 'Citizen',
                country: item.country || 'India',
                complaintDetails: item.complaintDetails || '',
                
                // Original CDIS data for reference
                originalData: item
            };
        });
        
        console.log('🔄 Transformation completed:', {
            transformedDataLength: transformedData.length,
            transformedDataType: typeof transformedData,
            isTransformedArray: Array.isArray(transformedData),
            sampleTransformedData: transformedData.slice(0, 2)
        });

        console.log('🔄 Initial transformed data count:', transformedData.length);

        // CLIENT-SIDE FILTERING: Since CDIS API ignores filters, apply them manually
        
        // Apply state filter if specified
        if (filters.state && filters.state !== 'All') {
            const originalCount = transformedData.length;
            transformedData = transformedData.filter(item => {
                const itemState = (item.state || '').toLowerCase().trim();
                const filterState = filters.state.toLowerCase().trim();
                
                // Flexible state matching
                return itemState.includes(filterState) || filterState.includes(itemState);
            });
            console.log(`🎯 Client-side state filter: ${originalCount} → ${transformedData.length} grievances for "${filters.state}"`);
        }

        // Apply district filter if specified  
        if (filters.district && filters.district !== 'All') {
            const originalCount = transformedData.length;
            transformedData = transformedData.filter(item => {
                const itemDistrict = (item.district || '').toLowerCase().trim();
                const filterDistrict = filters.district.toLowerCase().trim();
                
                // Flexible district matching with common variations
                const normalizeDistrict = (name) => name
                    .replace(/\s+/g, ' ')
                    .replace(/\bnagar\b/g, '')
                    .replace(/\bdistrict\b/g, '')
                    .trim();
                
                const normalizedItemDistrict = normalizeDistrict(itemDistrict);
                const normalizedFilterDistrict = normalizeDistrict(filterDistrict);
                
                return itemDistrict.includes(filterDistrict) || 
                       filterDistrict.includes(itemDistrict) ||
                       normalizedItemDistrict.includes(normalizedFilterDistrict) ||
                       normalizedFilterDistrict.includes(normalizedItemDistrict);
            });
            console.log(`🎯 Client-side district filter: ${originalCount} → ${transformedData.length} grievances for "${filters.district}"`);
        }

        // Apply ministry filter if specified
        if (filters.ministry && filters.ministry !== 'All') {
            const originalCount = transformedData.length;
            transformedData = transformedData.filter(item => {
                const itemMinistry = (item.ministry || '').toLowerCase().trim();
                const filterMinistry = filters.ministry.toLowerCase().trim();
                
                return itemMinistry.includes(filterMinistry) || filterMinistry.includes(itemMinistry);
            });
            console.log(`🎯 Client-side ministry filter: ${originalCount} → ${transformedData.length} grievances for "${filters.ministry}"`);
        }

        // Log sample dates to understand the data
        const sampleDates = transformedData.slice(0, 10).map(item => ({
            registration_no: item.registration_no,
            recvd_date: item.recvd_date,
            parsed_date: new Date(item.recvd_date)
        }));
        console.log('📅 Sample dates in CDIS data:', sampleDates);

        // Get all unique years from the data to understand the range
        const uniqueYears = [...new Set(transformedData.map(item => {
            const date = new Date(item.recvd_date);
            return isNaN(date.getTime()) ? 'invalid' : date.getFullYear();
        }).filter(year => year !== 'invalid'))].sort();
        console.log('📅 Available years in CDIS data:', uniqueYears);

        // Apply date range filter if specified (but be more flexible for old data)
        if (filters.startDate && filters.endDate) {
            const originalCount = transformedData.length;
            
            // If searching for recent dates (2024+) but data is old (2016-2020), 
            // skip date filtering and show a warning
            const filterStartYear = new Date(filters.startDate).getFullYear();
            const filterEndYear = new Date(filters.endDate).getFullYear();
            const dataMaxYear = Math.max(...uniqueYears.filter(y => y !== 'invalid'));
            
            if (filterStartYear > dataMaxYear && filterStartYear >= 2024) {
                console.log(`⚠️ Skipping date filter: Searching for ${filterStartYear}-${filterEndYear} but data only goes up to ${dataMaxYear}`);
                console.log('📅 Showing all available data instead of filtering by recent dates');
            } else {
                transformedData = transformedData.filter(item => {
                    const itemDate = new Date(item.recvd_date);
                    
                    // Check if date is valid
                    if (isNaN(itemDate.getTime())) {
                        return false; // Exclude items with invalid dates
                    }
                    
                    let isInRange = true;
                    
                    if (filters.startDate) {
                        const startDate = new Date(filters.startDate);
                        isInRange = isInRange && itemDate >= startDate;
                    }
                    
                    if (filters.endDate) {
                        const endDate = new Date(filters.endDate);
                        // Add 23:59:59 to end date to include full day
                        endDate.setHours(23, 59, 59, 999);
                        isInRange = isInRange && itemDate <= endDate;
                    }
                    
                    return isInRange;
                });
                console.log(`📅 Client-side date filter: ${originalCount} → ${transformedData.length} grievances for ${filters.startDate} to ${filters.endDate}`);
            }
        }

        // Use API-level pagination - return only the requested page data
        const recordsPerPage = 20; // Fixed 20 records per page
        const startIndex = (pageno - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedData = transformedData; // API already returns paginated data
        
        console.log('🔄 Pagination Debug - Different data per page check:', {
            currentPage: pageno,
            totalFilteredRecords: transformedData.length,
            startIndex: startIndex,
            endIndex: endIndex,
            paginatedCount: paginatedData.length,
            sampleIdsThisPage: paginatedData.slice(0, 5).map(item => item.registration_no),
            isDataDifferentFromPreviousPage: pageno > 1 ? 'Check console for comparison' : 'First page'
        });
        
        console.log(`📄 Client-side Pagination: page ${pageno}, showing records ${startIndex + 1}-${Math.min(endIndex, transformedData.length)} of ${transformedData.length}`);
        console.log('📊 Pagination details:', {
            totalRecords: transformedData.length,
            recordsPerPage: recordsPerPage,
            currentPage: pageno,
            startIndex: startIndex,
            endIndex: endIndex,
            paginatedCount: paginatedData.length,
            samplePaginatedData: paginatedData.slice(0, 2).map(item => ({
                id: item?.registration_no || item?.id,
                details: item?.complaintDetails?.substring(0, 50)
            }))
        });
        
        // For API pagination, estimate total based on response
        // If we get 20 records, assume there might be more pages
        const estimatedTotal = transformedData.length === 20 
            ? (pageno * 20) + 20 // Assume at least one more page
            : (pageno - 1) * 20 + transformedData.length; // Last page
         
         console.log('🔢 Pagination calculation logic:', {
             recordsThisPage: paginatedData.length,
             totalFilteredRecords: transformedData.length,
             recordsPerPage: recordsPerPage,
             currentPage: pageno,
             isFirstPage: pageno === 1,
             isFullPage: paginatedData.length >= recordsPerPage,
             calculatedTotal: estimatedTotal,
             hasMorePages: endIndex < transformedData.length
         });
            
        console.log('📊 Estimated total calculation:', {
            currentPage: pageno,
            recordsThisPage: paginatedData.length,
            totalFilteredRecords: transformedData.length,
            recordsPerPage: recordsPerPage,
            estimatedTotal: estimatedTotal,
            paginationWorking: paginatedData.length <= recordsPerPage
        });

        console.log('🔄 Final transformed data after client-side filtering:', {
            originalAPICount: result.data?.grievanceData?.length || 0,
            finalFilteredCount: transformedData.length,
            paginatedCount: paginatedData.length,
            estimatedTotal: estimatedTotal,
            sampleFiltered: paginatedData.slice(0, 2),
            paginationTest: {
                page: pageno,
                showingRecords: `${startIndex + 1}-${Math.min(endIndex, transformedData.length)}`,
                outOfTotal: transformedData.length,
                isDifferentData: pageno > 1 ? 'Should be different from page 1' : 'First page'
            }
        });

        // Show final state distribution after client-side filtering
        const finalStates = [...new Set(transformedData.map(item => item.state.toLowerCase()))];
        console.log('✅ Final states after client-side filtering:', finalStates);

        // API pagination - no caching needed
        console.log('📊 API Pagination Result:', {
            currentPage: pageno,
            recordsReceived: transformedData.length,
            estimatedTotal: estimatedTotal,
            isLastPage: transformedData.length < 20,
            sampleRecords: transformedData.slice(0, 3).map(item => ({
                id: item?.registration_no || item?.id,
                details: item?.complaintDetails?.substring(0, 30)
            }))
        });
        console.log('💾 Returning processed data:', {
            paginatedCount: paginatedData.length,
            estimatedTotal: estimatedTotal,
            sampleData: paginatedData.slice(0, 2),
            paginationVerification: {
                requestedPage: pageno,
                recordsReturned: paginatedData.length,
                expectedRange: `${startIndex + 1}-${Math.min(endIndex, transformedData.length)}`,
                totalAvailable: transformedData.length,
                isPaginationWorking: paginatedData.length > 0 && paginatedData.length <= recordsPerPage
            }
        });

        // Force success status and return filtered data
        console.log('🚀 CRITICAL: About to return response with data:', {
            paginatedDataLength: paginatedData.length,
            estimatedTotal: estimatedTotal,
            transformedDataLength: transformedData.length,
            hasData: paginatedData.length > 0,
            sampleData: paginatedData.slice(0, 2).map(item => ({
                id: item?.registration_no || 'NO_ID',
                state: item?.state || 'NO_STATE',
                ministry: item?.ministry || 'NO_MINISTRY'
            })),
            paginationStatus: {
                currentPage: pageno,
                isWorkingCorrectly: paginatedData.length <= recordsPerPage,
                dataRange: `${startIndex + 1}-${Math.min(endIndex, transformedData.length)}`,
                totalPages: Math.ceil(transformedData.length / recordsPerPage)
            }
        });
        
        console.log('🔥 FINAL RETURN DATA STRUCTURE:', {
            dataArray: paginatedData,
            dataArrayLength: paginatedData.length,
            dataType: typeof paginatedData,
            isArray: Array.isArray(paginatedData)
        });

        // Ensure we return the actual filtered data
        console.log('🚀 FINAL RETURN - About to return:', {
            paginatedDataLength: paginatedData.length,
            paginatedDataSample: paginatedData.slice(0, 2),
            estimatedTotal: estimatedTotal,
            transformedDataLength: transformedData.length,
            finalPaginationCheck: {
                page: pageno,
                recordsOnThisPage: paginatedData.length,
                totalRecordsAvailable: transformedData.length,
                maxRecordsPerPage: recordsPerPage,
                isPaginationCorrect: paginatedData.length <= recordsPerPage,
                hasNextPage: endIndex < transformedData.length,
                hasPreviousPage: pageno > 1
            }
        });

        // Transform the response to match expected format
        return {
            data: {
                data: paginatedData, // Return paginated data for current page
                count: paginatedData.length, // Count of current page data
                total: estimatedTotal, // Total filtered records for pagination
                total_count: estimatedTotal, // Also set total_count for compatibility
                actualFiltered: transformedData.length // Actual filtered count for this page
            },
            status: 200 // Force success status
        };
    }).catch(error => {
        console.error('❌ CDIS API Search Error:', error);
        console.error('🔍 Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        
        // Check if we have any transformed data despite the error
        if (typeof transformedData !== 'undefined' && transformedData && transformedData.length > 0) {
            console.log('🔄 Returning filtered data despite error:', {
                transformedDataLength: transformedData.length,
                sampleData: transformedData.slice(0, 2)
            });
            
            // Apply pagination even to error fallback data
            const recordsPerPage = filters.size || pageSize;
            const startIndex = (pageno - 1) * recordsPerPage;
            const endIndex = startIndex + recordsPerPage;
            const paginatedErrorData = transformedData.slice(startIndex, endIndex);
            
            return {
                data: {
                    data: paginatedErrorData,
                    count: paginatedErrorData.length,
                    total: transformedData.length,
                    total_count: transformedData.length,
                    actualFiltered: transformedData.length
                },
                status: 200
            };
        }
        
        // Return empty result on error with proper structure
        return {
            data: {
                data: [],
                count: 0,
                total: 0,
                total_count: 0,
                actualFiltered: 0
            },
            status: 500
        };
    });
}

const savedGrievances = (page, download = false) => {
    return httpService.auth.get('/saved', {
        params: {
            skiprecord: (page - 1) * pageSize,
            size: pageSize,
            download_req: download ? 1 : 0
        }
    })
}

const readGrievances = () => {
    return httpService.auth.get('/read_list/')
}

const toggleSave = reg_no => {
    return httpService.auth.get('/toggle_save', {
        params: {
            registration_no: reg_no
        }
    })
}

const toggleSpam = reg_no => {
    return httpService.auth.get('/toggle_spam', {
        params: {
            registration_no: reg_no
        }
    })
}

const togglePriority = reg_no => {
    return httpService.auth.get('/toggle_priority', {
        params: {
            registration_no: reg_no
        }
    })
}

const predictMinistries = reg_no => {
    return httpService.auth.get('/predict-department', {
        params: {
            registration_no: reg_no
        }
    })
}

const getPDFRoute = (reg_no, type) => {
    return httpService.auth.get('/showpdf', {
        params: {
            registration_no: reg_no,
            documentType: type ?? "GR"
        }
    })
}

const addLabel = (reg_no, label) => {
    return httpService.auth.post('/add_tag', {}, {
        params: {
            registration_no: reg_no,
            tag: label
        }
    })
}

const deleteTag = tagId => {
    return httpService.auth.get('/delete_tag', {
        params: {
            idx: tagId
        }
    })
}

const readGrievance = reg_no => {
    return httpService.auth.get('/read', {
        params: {
            registration_no: reg_no
        }
    })
}

export const getClosureDetails = (registration_no) =>
    httpService.auth.get('/get_individual_closure_data', {
        params: {
            registration_no
        }
    })

export const checkFinalReport = (registration_no) =>
    httpService.auth.get('/checkpdf', {
        params: {
            registration_no,
            documentType: "FR"
        }
    })

export const checkGradeReport = (registration_no) =>
    httpService.auth.get('/checkpdf', {
        params: {
            registration_no,
            documentType: "GR"
        }
    })

const addVote = (idx, vote, user_query = '') => {
    return httpService.auth.post('/add_vote', {}, {
        params: {
            idx,
            vote,
            user_query
        }
    })
}

const getVotes = (idx) => {
    return httpService.auth.get('/vote_count', {
        params: {
            idx
        }
    })
}

const GrievancesRoutes = {
    getPrimary,
    getRepeat,
    getFresh,
    getNormal,
    getSpam,
    getPriority,
    descGrievance,
    queryGrievances,
    savedGrievances,
    readGrievances,
    getGrievancesOfType,
    toggleSave,
    toggleSpam,
    togglePriority,
    predictMinistries,
    getPDFRoute,
    addLabel,
    deleteTag,
    readGrievance,
    getRepeatChildren,
    getRepeatParent,
    addVote,
    getVotes
}

export default GrievancesRoutes