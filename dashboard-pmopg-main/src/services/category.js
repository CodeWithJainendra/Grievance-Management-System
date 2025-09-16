import httpService from "./httpService";

// Mock implementations for category services using new API where possible
export const getTrendyKeywords = async () => {
    console.log('getTrendyKeywords mock called');
    // Mock trendy keywords
    return {
        data: ['electricity', 'water', 'food', 'pension', 'mid day meal']
    };
}

export const getTopSuggestions = async () => {
    console.log('getTopSuggestions mock called');
    // Mock top suggestions
    return {
        data: [
            { keyword: 'electricity bill', score: 0.95 },
            { keyword: 'water supply', score: 0.88 },
            { keyword: 'pension payment', score: 0.82 },
            { keyword: 'mid day meal', score: 0.78 },
            { keyword: 'ration card', score: 0.75 }
        ]
    };
}

export const getCategories = async (ministry, level) => {
    console.log('getCategories called with:', { ministry, level });
    // Mock category structure
    return {
        data: {
            children: [
                { title: ministry || 'General', count: 100, level: level || 1 },
                { title: 'Utilities', count: 45, level: level || 1 },
                { title: 'Food', count: 30, level: level || 1 },
                { title: 'Finance', count: 25, level: level || 1 }
            ]
        }
    };
}

export const getTopCategories = async (filters) => {
    console.log('getTopCategories called with:', filters);
    // Mock top categories with filters applied
    const mockCategories = [
        { category: 'Electricity', count: 150, state: filters.state, district: filters.district },
        { category: 'Water Supply', count: 120, state: filters.state, district: filters.district },
        { category: 'Pension', count: 95, state: filters.state, district: filters.district },
        { category: 'Ration', count: 80, state: filters.state, district: filters.district },
        { category: 'Education', count: 65, state: filters.state, district: filters.district }
    ];
    
    return {
        data: mockCategories
    };
}

export const getSuggestions = async (ministry, user_query) => {
    console.log('getSuggestions called with:', { ministry, user_query });
    // Mock suggestions based on query
    const mockSuggestions = [
        { suggestion: `${user_query} issue`, score: 0.95 },
        { suggestion: `${user_query} complaint`, score: 0.88 },
        { suggestion: `${user_query} service`, score: 0.82 },
        { suggestion: `${user_query} department`, score: 0.75 }
    ];
    
    return {
        data: mockSuggestions
    };
}
