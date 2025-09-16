import httpService from "./httpService";

export const getRCAData = (ministry, financialTerm) => {
    return httpService.auth.get('/rca_result', {
        params: {
            ministry: ministry,
            financialterm: financialTerm
        }
    })
}

export const getGrievancesUsingRegNos = (grievanceRegNos = []) => {
    return httpService.auth.post('/get_userdata', {}, {
        params: {
            'registration_no_list': grievanceRegNos.join(',') + ','
        }
    })
}

export const getCategoryTree = ({
    from,
    to,
    state = 'All',
    district = 'All',
    ministry = 'All',
    showAll = true
}) => {
    // New API doesn't support filters, so fetch broad data and filter client-side
    // For demo, use a general query; in production, consider pagination or backend adjustment
    const query = 'grievance'; // Default broad query; could derive from filters if needed
    const params = {
        query: query,
        value: 1, // Semantic search
        skiprecord: 0,
        size: 1000, // Increase to get more data for tree building
        threshold: 1.5
    };

    return httpService.external.get('', { params }); // Use base path, full URL built in httpService
}

export const getCategorySearch = async (filters) => {
    console.log('getCategorySearch called with filters:', filters);
    
    // Use new external API for category search, similar to getCategoryTree
    const query = filters.query || 'grievance'; // Use provided query or default
    const params = {
        query: query,
        value: parseInt(filters.value) || 1, // Semantic search, or use filters.value (3 for hybrid, etc.)
        skiprecord: 0,
        size: 1000, // Large size for tree building
        threshold: parseFloat(filters.threshold) || 1.5
    };

    try {
        const response = await httpService.external.get('', { params }); // Use base path, full URL built in httpService
        console.log('getCategorySearch response:', response);
        return response;
    } catch (error) {
        console.error('getCategorySearch error:', error);
        throw error;
    }
}



export const getDynamicRca = (filters = {}) => {
    return httpService.auth.post('dynamicrca', {}, {
        params: filters
    })
}

export const getRealTimeRCA = (filters = {}) => {
    return httpService.auth.post('realtimerca', {}, {
        params: filters
    })
}

export const fetchAICategories = (filters = {}) => {
    return httpService.auth.post('generate_ai_categories', filters)
}

export const fetchAICategoriesHistory = (filters = {}) => {
    return httpService.auth.get('get_ai_categories', filters)
}

export const getCriticalCategories = () => {
    return httpService.auth.get('/critical_categories/')
}
