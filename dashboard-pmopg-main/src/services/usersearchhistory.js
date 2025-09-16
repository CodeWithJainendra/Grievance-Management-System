import httpService from "./httpService";

// Mock implementations for user search history to prevent errors
const rowsPerPage = 20;

export const getSearch = async (pageno = 1) => {
    console.log('getSearch mock called with page:', pageno);
    // Mock search history data
    return {
        data: {
            search_results: [
                { id: 1, query: 'electricity', date: '2025-01-15', results: 45 },
                { id: 2, query: 'water supply', date: '2025-01-14', results: 32 },
                { id: 3, query: 'pension', date: '2025-01-13', results: 28 }
            ],
            total: 100,
            page: pageno
        }
    };
}

export const getDownloadPath = async (id) => {
    console.log('getDownloadPath mock called with id:', id);
    return {
        data: {
            download_url: `/api/download/${id}`,
            filename: `search_results_${id}.csv`
        }
    };
}

export const deleteHistory = async (id) => {
    console.log('deleteHistory mock called with id:', id);
    return {
        data: {
            success: true,
            message: `Search history ${id} deleted successfully`
        }
    };
}

export default {
    getSearch,
    getDownloadPath,
    deleteHistory
};