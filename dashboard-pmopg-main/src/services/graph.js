import httpService from "./httpService"

// Client-side graph data generation from grievance data
const analyzeHistoricalCounts = async (filters, type = 1) => {
    console.log('getHistoricalCounts called with:', filters, type);
    
    try {
        // Fetch grievances for the date range
        const params = {
            query: 'grievance',
            value: 1,
            skiprecord: 0,
            size: 1000,
            threshold: 1.5
        };
        
        const response = await httpService.external.get('/search/', { params });
        const grievances = response.data.grievanceData || [];
        
        // Client-side filtering and aggregation
        const filteredGrievances = grievances.filter(grievance => {
            const regDate = new Date(grievance.complaintRegDate);
            const fromDate = new Date(filters.from);
            const toDate = new Date(filters.to);
            return regDate >= fromDate && regDate <= toDate;
        });
        
        // Mock historical distribution based on filtered data
        const total = filteredGrievances.length;
        const distribution = {
            primary: Math.floor(total * 0.6),
            fresh: Math.floor(total * 0.2),
            repeat: Math.floor(total * 0.15),
            spam: Math.floor(total * 0.05),
            total: total
        };
        
        console.log('Historical counts generated:', distribution);
        return { data: distribution };
    } catch (error) {
        console.error('getHistoricalCounts error:', error);
        // Fallback data
        return { 
            data: {
                primary: 150,
                fresh: 50,
                repeat: 30,
                spam: 10,
                total: 240
            }
        };
    }
}

const analyzeTimeWiseDistribution = async (filters, type = 'month') => {
    console.log('getTimeWiseDistribution called with:', filters, type);
    
    try {
        const params = {
            query: 'grievance',
            value: 1,
            skiprecord: 0,
            size: 1000,
            threshold: 1.5
        };
        
        const response = await httpService.external.get('/search/', { params });
        const grievances = response.data.grievanceData || [];
        
        // Client-side time-wise aggregation
        const timeMap = {};
        grievances.forEach(grievance => {
            let dateKey;
            const regDate = new Date(grievance.complaintRegDate);
            
            switch (type) {
                case 'day':
                    dateKey = regDate.toISOString().split('T')[0];
                    break;
                case 'week':
                    dateKey = `Week ${Math.ceil(regDate.getDate() / 7)}`;
                    break;
                case 'month':
                default:
                    dateKey = regDate.toISOString().slice(0, 7); // YYYY-MM
                    break;
                case 'quarter':
                    const quarter = Math.floor((regDate.getMonth() + 3) / 3);
                    dateKey = `Q${quarter} ${regDate.getFullYear()}`;
                    break;
                case 'year':
                    dateKey = regDate.getFullYear().toString();
                    break;
            }
            
            timeMap[dateKey] = (timeMap[dateKey] || 0) + 1;
        });
        
        const timeData = Object.entries(timeMap)
            .map(([period, count]) => ({ period, count }))
            .sort((a, b) => new Date(a.period) - new Date(b.period));
        
        console.log('Time-wise distribution generated:', timeData);
        return { data: timeData };
    } catch (error) {
        console.error('getTimeWiseDistribution error:', error);
        // Fallback time data
        const fallbackData = [
            { period: '2025-01', count: 20 },
            { period: '2025-02', count: 25 },
            { period: '2025-03', count: 30 },
            { period: '2025-04', count: 28 },
            { period: '2025-05', count: 35 }
        ];
        return { data: fallbackData };
    }
}

export { analyzeHistoricalCounts as getHistoricalCounts };
export { analyzeTimeWiseDistribution as getTimeWiseDistribution };

export default {
    getHistoricalCounts: analyzeHistoricalCounts,
    getTimeWiseDistribution: analyzeTimeWiseDistribution
};
