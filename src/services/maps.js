import { defaultThreshold } from "@/helpers/env";
import httpService from "./httpService";
import { filteredQueryBuilder } from "./grievances";
import searchService from "./searchService";

const handleCatch = (error, reject) => {
    console.log(error)
    reject(error)
}

const getHeatmapGrievances = (ministry, from, to, state = 'All', district = 'All') => {
    // For the heatmap, we want to get data for all states initially
    // But if a specific state is selected, we should filter by that state
    // The stateWiseCounts function already handles this properly
    
    // Create filters object that stateWiseCounts expects
    const filters = {
        ministry,
        startDate: from,
        endDate: to,
        state: state, // Pass the state filter
        district: district, // Pass the district filter
        query: '', // Empty query for general heatmap
        type: 1, // Semantic search type
        threshold: defaultThreshold
    };
    
    // Use the stateWiseCounts function which properly handles all filters
    return stateWiseCounts(filters, 1).then(result => {
        // Transform the result to match the expected format of the original function
        const stateDistribution = result.data.state_wise_distribution || {};
        
        // Convert to the format expected by the HeatMap2 component
        // The HeatMap2 component expects an array of objects with state and count properties
        let formattedData = [];
        
        // If a specific state is selected, only include that state in the results
        if (state !== 'All') {
            const stateName = state.toLowerCase();
            if (stateDistribution[stateName]) {
                formattedData = [{
                    state: stateName,
                    count: stateDistribution[stateName]
                }];
            } else {
                // If no data for the selected state, include it with count 0
                formattedData = [{
                    state: stateName,
                    count: 0
                }];
            }
        } else {
            // Convert all states to the expected format
            formattedData = Object.entries(stateDistribution).map(([state, count]) => ({
                state: state.toLowerCase(),
                count: count
            }));
        }
        
        console.log('🗺️ Formatted heatmap data:', {
            originalDistribution: stateDistribution,
            formattedData: formattedData,
            selectedState: state
        });
        
        return {
            data: formattedData,
            status: 200
        };
    }).catch(error => {
        console.error('❌ Error in getHeatmapGrievances:', error);
        return {
            data: [],
            status: 500,
            error: error.message
        };
    });
}

const getPmayGrievances = (ministry, from, to) => {
    return new Promise((resolve, reject) => {
        httpService.get(`/pmay?ministry=${ministry}&from=${from}&to=${to}`)
            .then(response => {
                resolve(response)
            })
            .catch(error => {
                handleCatch(error, reject)
            })
    })
}

const getDistrictCount = (state, ministry, from, to) => {
    return new Promise((resolve, reject) => {
        httpService.get(`/district_count?state=${state}&ministry=${ministry}&from=${from}&to=${to}`)
            .then(response => {
                resolve(response)
            })
            .catch(error => {
                handleCatch(error, reject)
            })
    })
}

const searchSpatially = (query, type, ministry, from, to, state = 'All', district = 'All', showClosed = 1, threshold = defaultThreshold, recordInHistory = true) => {
    return new Promise((resolve, reject) => {
        httpService.get(`/search?query=${query}&type=${type}&ministry=${ministry}&from=${from}&to=${to}&state=${state}&district=${district}&showClosed=${showClosed}&threshold=${threshold}&recordInHistory=${recordInHistory}`)
            .then(response => {
                resolve(response)
            })
            .catch(error => {
                handleCatch(error, reject)
            })
    })
}

const searchSpatiallyAndSilently = (query, type, ministry, from, to) => {
    return searchSpatially(query, type, ministry, from, to, 'All', 'All', 1, defaultThreshold, false)
}

const searchSpatiallyForState = (filename, state) => {
    return new Promise((resolve, reject) => {
        httpService.get(`/search_for_state?filename=${filename}&state=${state}`)
            .then(response => {
                resolve(response)
            })
            .catch(error => {
                handleCatch(error, reject)
            })
    })
}

const stateWiseCounts = async (filters, page_no) => {
    try {
        console.log('🗺️ Fetching state-wise counts from User API:', { 
            query: filters.query, 
            type: filters.type,
            state: filters.state,
            district: filters.district,
            ministry: filters.ministry,
            startDate: filters.startDate,
            endDate: filters.endDate,
            fullFiltersObject: JSON.stringify(filters, null, 2)
        });

        // Use User's API to get state-wise distribution
        const searchParams = {
            query: filters.query || "",
            value: filters.type || 1,
            skiprecord: 0,
            size: 1000, // Get more data for state distribution
            threshold: filters.threshold || 1.2
        };

        console.log('📡 User API call for state distribution:', searchParams);

        const result = await searchService.getStateWiseDistribution(searchParams);
        
        if (result.success && result.data) {
            console.log('📊 Received state-wise distribution data:', result.data);
            
            // Return the state-wise distribution data directly from API
            return {
                data: {
                    state_wise_distribution: result.data.state_wise_distribution || result.data
                },
                success: true
            };
        } else {
            console.warn('⚠️ Maps: No data received from state distribution API');
            return {
                data: {
                    state_wise_distribution: {}
                },
                success: false,
                error: 'No data received from API'
            };
        }
    } catch (error) {
        console.error('❌ Maps: State-wise counts failed:', error);
        return {
            data: {
                state_wise_distribution: {}
            },
            success: false,
            error: error.message || 'Failed to fetch state-wise distribution'
        };
    }
}

const districtWiseCounts = async (filters, page_no) => {
    try {
        console.log('🏘️ Fetching district-wise counts from User API:', filters);
        
        // Use User's search API to get grievances for specific state
        const searchParams = {
            query: filters.query || "",
            value: filters.type || 1,
            skiprecord: 0,
            size: 1000, // Get more data for district distribution
            threshold: filters.threshold || 1.2
        };

        console.log('📡 User API call for district data:', searchParams);

        const result = await searchService.searchGrievances(searchParams);
        
        if (result.success && result.grievances) {
            console.log('📊 Processing', result.grievances.length, 'grievances for district distribution');
            
            // Calculate district-wise distribution from grievances
            const districtDistribution = {};
            
            result.grievances.forEach(grievance => {
                const district = grievance.district || grievance.districtName || 'Unknown';
                if (district && district !== 'Unknown') {
                    districtDistribution[district.toLowerCase()] = (districtDistribution[district.toLowerCase()] || 0) + 1;
                }
            });
            
            console.log('🏘️ District distribution calculated:', districtDistribution);
            
            return {
                data: {
                    district_wise_distribution: districtDistribution
                },
                success: true
            };
        } else {
            console.warn('⚠️ Maps: No grievance data received for district distribution');
            return {
                data: {
                    district_wise_distribution: {}
                },
                success: false,
                error: 'No grievance data received'
            };
        }
    } catch (error) {
        console.error('❌ Maps: District-wise counts failed:', error);
        return {
            data: {
                district_wise_distribution: {}
            },
            success: false,
            error: error.message || 'Failed to fetch district-wise distribution'
        };
    }
}

export default {
    getHeatmapGrievances,
    getPmayGrievances,
    getDistrictCount,
    searchSpatially,
    searchSpatiallyAndSilently,
    searchSpatiallyForState,
    stateWiseCounts,
    districtWiseCounts
}