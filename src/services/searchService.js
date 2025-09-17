import httpService from './httpService';

// Search types enum
export const SEARCH_TYPES = {
  SEMANTIC: 1,
  KEYWORD: 2,
  HYBRID: 3
};

class SearchService {
  constructor() {
    this.baseURL = 'https://cdis.iitk.ac.in/consumer_api/search/';
    this.stateDistributionURL = 'https://cdis.iitk.ac.in/consumer_api/search/'; // Use same endpoint for distribution
  }

  /**
   * Search grievances using the search API
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query
   * @param {number} params.value - Search type (1=semantic, 2=keyword, 3=hybrid)
   * @param {number} params.skiprecord - Number of records to skip for pagination
   * @param {number} params.size - Number of records to return
   * @param {number} params.threshold - Relevance threshold
   * @param {string} params.startDate - Start date filter
   * @param {string} params.endDate - End date filter
   * @param {string} params.state - State filter
   * @param {string} params.district - District filter
   * @param {string} params.ministry - Ministry filter
   * @param {number} params.all_record - Include all records flag
   * @param {number} params.page_req - Page request number
   * @returns {Promise<Object>} Search results
   */
  async searchGrievances(params) {
    try {
      console.log('🔍 SearchService: Making API call with params:', params);
      
      // Clean up null/undefined parameters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
      );
      
      // Make direct API call to user's endpoint
      const response = await fetch(`${this.baseURL}?${new URLSearchParams(cleanParams)}`);
      const data = await response.json();
      
      console.log('✅ SearchService: API response received:', {
        status: response.status,
        dataKeys: Object.keys(data || {}),
        grievancesCount: data?.grievanceData?.length || 0,
        totalCount: data?.total_count?.total_count || 0
      });
      
      // Transform the response to match expected format
      if (data && data.grievanceData) {
        return {
          success: true,
          grievances: data.grievanceData || [],
          totalCount: data.total_count?.total_count || data.grievanceData.length,
          count: data.grievanceData.length,
          message: data.message || 'Search completed successfully'
        };
      } else {
        console.warn('⚠️ SearchService: Unexpected response format:', data);
        return {
          success: false,
          grievances: [],
          totalCount: 0,
          count: 0,
          error: 'Invalid response format from search API'
        };
      }
    } catch (error) {
      console.error('❌ SearchService: API call failed:', error);
      
      return {
        success: false,
        grievances: [],
        totalCount: 0,
        count: 0,
        error: error.response?.data?.message || error.message || 'Search request failed'
      };
    }
  }

  /**
   * Get state-wise distribution
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} State-wise distribution data
   */
  async getStateWiseDistribution(params) {
    try {
      console.log('🗺️ SearchService: Getting state-wise distribution with params:', params);
      
      // Build parameters in the format expected by the user's API
      const apiParams = {
        startDate: params.startDate || params.from || '2016-01-01',
        endDate: params.endDate || params.to || '2025-12-31',
        state: params.state || 'All',
        ministry: params.ministry || 'All',
        type: '1',
        query: params.query || 'All',
        threshold: params.threshold || '1.2',
        all_record: '1',
        page_req: '0',
        value: '1',
        skiprecord: '0',
        size: '10000' // Get more records for better distribution
      };
      
      // Clean up null/undefined parameters
      const cleanParams = Object.fromEntries(
        Object.entries(apiParams).filter(([_, value]) => value !== null && value !== undefined)
      );
      
      // Make direct API call to user's endpoint
      const response = await fetch(`${this.stateDistributionURL}?${new URLSearchParams(cleanParams)}`);
      const data = await response.json();
      
      console.log('✅ SearchService: State distribution received:', {
        status: response.status,
        dataKeys: Object.keys(data || {}),
        grievanceDataCount: data?.grievanceData?.length || 0,
        totalCount: data?.total_count
      });
      
      // Calculate state-wise distribution from grievanceData
      if (data && data.grievanceData) {
        const stateDistribution = {};
        data.grievanceData.forEach(grievance => {
          let stateName = grievance.stateName || grievance.state || 'Unknown';
          
          // Normalize state names and handle special cases
          if (stateName === 'Unknown' || stateName === 'nan' || !stateName) {
            stateName = 'Unknown';
          } else {
            // Convert to uppercase for consistency
            stateName = stateName.toUpperCase();
          }
          
          stateDistribution[stateName.toLowerCase()] = (stateDistribution[stateName.toLowerCase()] || 0) + 1;
        });
        
        return {
          success: true,
          data: {
            state_wise_distribution: stateDistribution
          },
          totalCount: data.total_count?.total_count || data.grievanceData.length,
          message: 'State distribution calculated successfully'
        };
      } else {
        return {
          success: false,
          data: {
            state_wise_distribution: {}
          },
          totalCount: 0,
          error: 'No grievance data received'
        };
      }
    } catch (error) {
      console.error('❌ SearchService: State distribution failed:', error);
      
      return {
        success: false,
        data: {
          state_wise_distribution: {}
        },
        totalCount: 0,
        error: error.message || 'State distribution request failed'
      };
    }
  }

  /**
   * Get search suggestions
   * @param {string} query - Partial query for suggestions
   * @returns {Promise<Array>} Array of suggestions
   */
  async getSearchSuggestions(query) {
    try {
      const response = await httpService.get(`${this.baseURL}/suggestions`, {
        params: { q: query }
      });
      
      return response.data?.suggestions || [];
    } catch (error) {
      console.error('❌ SearchService: Failed to get suggestions:', error);
      return [];
    }
  }

  /**
   * Get search history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of search history items
   */
  async getSearchHistory(userId) {
    try {
      const response = await httpService.get(`${this.baseURL}/history`, {
        params: { userId }
      });
      
      return response.data?.history || [];
    } catch (error) {
      console.error('❌ SearchService: Failed to get search history:', error);
      return [];
    }
  }

  /**
   * Save search query to history
   * @param {string} userId - User ID
   * @param {string} query - Search query to save
   * @param {Object} filters - Applied filters
   * @returns {Promise<boolean>} Success status
   */
  async saveSearchHistory(userId, query, filters = {}) {
    try {
      await httpService.post(`${this.baseURL}/history`, {
        userId,
        query,
        filters,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('❌ SearchService: Failed to save search history:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const searchService = new SearchService();
export default searchService;

// Also export the class for testing purposes
export { SearchService };