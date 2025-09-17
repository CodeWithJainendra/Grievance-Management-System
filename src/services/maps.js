import { defaultThreshold } from "@/helpers/env";
import httpService from "./httpService";
import { filteredQueryBuilder } from "./grievances";
import searchService from "./searchService";

const handleCatch = (error, reject) => {
    console.log(error)
    reject(error)
}

const getHeatmapGrievances = async (ministry, from, to, state = 'All', district = 'All') => {
    try {
        console.log('🗺️ Getting heatmap grievances with params:', { ministry, from, to, state, district });
        
        // Use the user's API endpoint directly
        const apiUrl = 'https://cdis.iitk.ac.in/consumer_api/search/';
        console.log('🌐 API URL:', apiUrl);
        
        // Build query parameters matching the user's API format
        const params = new URLSearchParams({
            startDate: from,
            endDate: to,
            state: state,
            ministry: ministry,
            type: '1',
            query: 'All',
            threshold: '1.2',
            all_record: '1',
            page_req: '0',
            value: '1',
            skiprecord: '0',
            size: '10000' // Get more records for better state distribution
        });
        
        const fullUrl = `${apiUrl}?${params}`;
        console.log('🔗 Full API URL:', fullUrl);
        console.log('📋 Query params:', params.toString());
        
        console.log('🚀 About to make fetch request...');
        
        let response, data;
        
        try {
            response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                mode: 'cors' // Explicitly set CORS mode
            });
            
            console.log('📡 Fetch response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            console.log('🔄 Parsing JSON response...');
            data = await response.json();
            console.log('📊 JSON data parsed:', data);
        } catch (fetchError) {
            console.error('🚨 Fetch request failed:', fetchError);
            console.error('🚨 Error details:', {
                name: fetchError.name,
                message: fetchError.message,
                stack: fetchError.stack
            });
            throw fetchError; // Re-throw to be caught by outer try-catch
        }
        
        console.log('🗺️ API Response received:', {
            status: response.status,
            totalCount: data?.total_count,
            grievanceDataLength: data?.grievanceData?.length
        });
        
        if (!data.grievanceData) {
            console.warn('⚠️ No grievance data received from API');
            return {
                data: [],
                status: 200
            };
        }
        
        // Process state-wise distribution from API data
        const stateDistribution = {};
        data.grievanceData.forEach(grievance => {
            let stateName = grievance.stateName || 'Unknown';
            
            // Normalize state names and handle special cases
            if (stateName === 'Unknown' || stateName === 'nan' || !stateName) {
                stateName = 'Unknown';
            } else {
                // Normalize state name to match state_id_pair format
                stateName = stateName.toLowerCase().trim();
                
                // Handle specific state name variations from API
                const stateNameMappings = {
                    'tamil nadu': 'tamilnadu',
                    'andhra pradesh': 'andhra pradesh',
                    'arunachal pradesh': 'arunachal pradesh',
                    'himachal pradesh': 'himachal pradesh',
                    'madhya pradesh': 'madhya pradesh',
                    'uttar pradesh': 'uttar pradesh',
                    'west bengal': 'west bengal',
                    'jammu and kashmir': 'jammu and kashmir',
                    'dadra and nagar haveli': 'dadra and nagar haveli',
                    'daman and diu': 'daman and diu',
                    'andaman and nicobar islands': 'andaman and nicobar islands'
                };
                
                // Use mapping if available, otherwise use normalized name
                stateName = stateNameMappings[stateName] || stateName;
            }
            
            stateDistribution[stateName] = (stateDistribution[stateName] || 0) + 1;
        });
        
        // Convert to format expected by HeatMap2 component
        let formattedData = Object.entries(stateDistribution)
            .map(([state, count]) => ({
                state: state, // Keep the normalized state name
                count: count
            }))
            .sort((a, b) => b.count - a.count); // Sort by count descending
        
        // If a specific state is selected, filter the results
        if (state !== 'All') {
            const selectedState = state.toLowerCase();
            formattedData = formattedData.filter(item => 
                item.state.includes(selectedState) || selectedState.includes(item.state)
            );
        }
        
        console.log('🗺️ Processed choropleth data:', {
            totalStates: formattedData.length,
            topStates: formattedData.slice(0, 5),
            totalGrievances: formattedData.reduce((sum, item) => sum + item.count, 0)
        });
        
        return {
            data: formattedData,
            status: 200
        };
        
    } catch (error) {
        console.error('❌ Error in getHeatmapGrievances:', error);
        return {
            data: [],
            status: 500,
            error: error.message
        };
    }
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