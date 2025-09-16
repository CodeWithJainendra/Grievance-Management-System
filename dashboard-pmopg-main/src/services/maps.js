import { defaultThreshold } from "@/helpers/env";
import httpService from "./httpService";
import { filteredQueryBuilder } from "./grievances";

const handleCatch = (error, reject) => {
    console.log(error)
    reject(error)
}

const getHeatmapGrievances = async (ministry, from, to, query = 'grievance', type = 1, state = 'All', district = 'All', showClosed = 1, threshold = 1.2) => {
    console.log('getHeatmapGrievances called with params:', { ministry, from, to, query, type, state, district, showClosed, threshold })
    
    try {
        // Use the same /search endpoint as grievance search for consistency
        const filters = {
            query: query,
            type: type,
            startDate: from,
            endDate: to,
            state: state === 'All' ? null : state,
            district: district === 'All' ? null : district,
            ministry: ministry,
            all_record: showClosed ? 1 : 0,
            threshold: threshold,
            size: 5000, // Large dataset for spatial analysis
            page_req: 0 // Don't record in history for spatial searches
        };

        const response = await filteredQueryBuilder('/search', filters, 1);
        
        console.log('Heatmap API response received:', {
            total: response.data.total_count || response.data.count || 0,
            grievances: (response.data.grievanceData || response.data.data || []).length
        })
        
        return response;
    } catch (error) {
        console.error('Heatmap API error:', error);
        throw new Error(`Failed to fetch heatmap data: ${error.response?.data?.message || error.message}`);
    }
}

const getPmayGrievances = (ministry, from, to) => {
    return new Promise((resolve, reject) => {
        httpService.get('/search', {
            params: {
                'query': 'pmay',
                'value': 1,
                'startDate': from,
                'endDate': to,
                'ministry': ministry
            }
        })
            .then(response => resolve(response))
            .catch(error => handleCatch(error, reject))
    })
}

const getDistrictCount = async (state, ministry, from, to, grievances) => {
    console.log('getDistrictCount called with:', { state, ministry, from, to });
    
    // Client-side district aggregation - improved field matching
    if (!grievances || grievances.length === 0) {
        return { data: [] };
    }
    
    const districtMap = {};
    
    grievances.forEach(grievance => {
        // Normalize state matching (handle variations)
        const grievanceState = (grievance.state || grievance.state_name || grievance.StateName || '').toLowerCase().trim();
        const targetState = state.toLowerCase().trim();
        
        if (state !== 'All' && !grievanceState.includes(targetState) && targetState !== 'all') {
            return;
        }
        
        // Ministry filter - more flexible matching
        const grievanceMinistry = (grievance.ministry || grievance.department || grievance.companyName || '').toLowerCase().trim();
        const targetMinistry = ministry.toLowerCase().trim();
        
        if (ministry !== 'All' && !grievanceMinistry.includes(targetMinistry)) {
            return;
        }
        
        // Date filter
        const grievanceDate = new Date(grievance.received_date || grievance.created_date || grievance.date || from);
        const start = new Date(from);
        const end = new Date(to);
        
        if (grievanceDate < start || grievanceDate > end) {
            return;
        }
        
        // District extraction - multiple possible fields
        const district = (grievance.district || grievance.district_name || grievance.CityName || grievance.city || 'Unknown').trim();
        if (district && district !== 'Unknown') {
            districtMap[district] = (districtMap[district] || 0) + 1;
        }
    });
    
    console.log('District counts for spatial analysis:', districtMap);
    const districts = Object.entries(districtMap)
        .map(([name, count]) => ({ name, count, state }))
        .sort((a, b) => b.count - a.count);
    
    return { data: districts };
}

const searchSpatially = (query, type, ministry, from, to, state = 'All', district = 'All', showClosed = 1, threshold = defaultThreshold, recordInHistory = true) => {
    return httpService.auth.get('/spatial_analysis', {
        params: {
            query: query,
            type: type,
            startDate: from,
            endDate: to,
            state: state,
            district: district,
            ministry: ministry,
            all_record: showClosed,
            threshold: threshold,
            page_req: recordInHistory ? 0 : 1
        }
    })
}

const searchSpatiallyAndSilently = (query, type, ministry, from, to) => {
    return searchSpatially(query, type, ministry, from, to, 'All', 'All', 1, defaultThreshold, false)
}

const searchSpatiallyForState = (filename, state) => {
    return httpService.auth.get('/get_state_data', {
        params: {
            filename: filename,
            state: state
        }
    })
}

const stateWiseCounts = (filters, page_no) =>
    filteredQueryBuilder('/get_state_wise_distribution', filters, page_no)

const districtWiseCounts = (filters, page_no) =>
    filteredQueryBuilder('/get_district_wise_distribution', filters, page_no)

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