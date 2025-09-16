import httpService from "./httpService"

// Mock implementations for redressal flagging using new API where possible
export const getRedressalFlags = async (filters) => {
    console.log('getRedressalFlags called with:', filters);
    
    try {
        // Use new API for grievance search, then mock flagging logic
        const params = {
            query: filters.query || 'grievance',
            value: 1,
            skiprecord: 0,
            size: filters.size || 100,
            threshold: filters.threshold || 1.5
        };
        
        const response = await httpService.external.get('/search/', { params });
        const grievances = response.data.grievanceData || [];
        
        // Mock flagging based on grievance content
        const flaggedGrievances = grievances.map(grievance => ({
            ...grievance,
            flagged: Math.random() > 0.7, // 30% flagged
            flagType: Math.random() > 0.5 ? 'high_priority' : 'follow_up',
            flagScore: Math.random() * 10
        })).filter(g => g.flagged);
        
        return {
            data: {
                flagged: flaggedGrievances,
                totalFlagged: flaggedGrievances.length,
                totalGrievances: grievances.length
            }
        };
    } catch (error) {
        console.error('getRedressalFlags error:', error);
        // Fallback mock data
        return {
            data: {
                flagged: [
                    { id: 1, complaintDetails: 'High priority electricity issue', flagged: true, flagType: 'high_priority', flagScore: 8.5 },
                    { id: 2, complaintDetails: 'Water supply complaint', flagged: true, flagType: 'follow_up', flagScore: 6.2 },
                    { id: 3, complaintDetails: 'Pension delay', flagged: true, flagType: 'high_priority', flagScore: 9.1 }
                ],
                totalFlagged: 3,
                totalGrievances: 50
            }
        };
    }
}

export const getFlaggingData = async (search_method, state, district) => {
    console.log('getFlaggingData called with:', { search_method, state, district });
    
    try {
        const params = {
            query: search_method || 'grievance',
            value: 1,
            skiprecord: 0,
            size: 100,
            threshold: 1.5
        };
        
        const response = await httpService.external.get('/search/', { params });
        const grievances = response.data.grievanceData || [];
        
        // Filter by state and district
        const filtered = grievances.filter(grievance => {
            if (state !== 'All' && grievance.stateName !== state) return false;
            if (district !== 'All' && grievance.CityName !== district) return false;
            return true;
        });
        
        // Mock flagging statistics
        const flaggingStats = {
            total: filtered.length,
            flagged: Math.floor(filtered.length * 0.25),
            highPriority: Math.floor(filtered.length * 0.1),
            followUp: Math.floor(filtered.length * 0.15),
            avgFlagScore: 6.8
        };
        
        return {
            data: flaggingStats
        };
    } catch (error) {
        console.error('getFlaggingData error:', error);
        // Fallback flagging data
        return {
            data: {
                total: 45,
                flagged: 12,
                highPriority: 5,
                followUp: 7,
                avgFlagScore: 7.2
            }
        };
    }
}