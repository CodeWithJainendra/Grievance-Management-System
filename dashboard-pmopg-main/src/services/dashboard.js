import { defaultFrom, defaultTo, pageSize } from "@/helpers/env";
import httpService from "./httpService";
import { format, sub } from "date-fns";

const formatDate = (date = new Date()) => format(date, 'yyyy-MM-dd')

// Mock data generation based on grievance analysis
const generateMockCounts = (grievances) => {
    const total = grievances.length;
    const primary = Math.floor(total * 0.6);
    const fresh = Math.floor(total * 0.2);
    const repeat = Math.floor(total * 0.15);
    const spam = Math.floor(total * 0.05);
    const urgent = Math.floor(total * 0.1);

    return {
        primary_count: primary,
        fresh_count: fresh,
        repeat_count: repeat,
        spam_count: spam,
        urgent_count: urgent,
        total_grievances: total
    };
}

const generateMockBarGraph = (grievances) => {
    const stateMap = {};
    grievances.forEach(grievance => {
        const state = grievance.stateName || 'Unknown';
        stateMap[state] = (stateMap[state] || 0) + 1;
    });

    return Object.entries(stateMap)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 states
}

const generateMockLineGraph = (grievances) => {
    const dateMap = {};
    grievances.forEach(grievance => {
        const date = grievance.complaintRegDate ? grievance.complaintRegDate.split('T')[0] : formatDate();
        dateMap[date] = (dateMap[date] || 0) + 1;
    });

    return Object.entries(dateMap)
        .map(([key_as_string, doc_count]) => ({ key_as_string, doc_count })) // Match expected format
        .sort((a, b) => new Date(a.key_as_string) - new Date(b.key_as_string));
}

const getRepeatersMock = (from, to, ministry, state, district, skip, take) => {
    return {
        data: [
            { name: 'Ramesh Kumar', count: 12, registration_no: 'REG001' },
            { name: 'Sita Devi', count: 8, registration_no: 'REG002' },
            { name: 'Rajesh Singh', count: 6, registration_no: 'REG003' },
            { name: 'Priya Sharma', count: 5, registration_no: 'REG004' },
            { name: 'Amit Patel', count: 4, registration_no: 'REG005' }
        ].slice(skip, skip + take)
    };
}

// Main functions using new API where possible, mocks otherwise
export const getPrimaryCount = async (ministry, from, to) => {
    console.log('getPrimaryCount called with:', { ministry, from, to });
    try {
        const response = await httpService.external.get('', {
            params: { query: 'grievance', value: 1, size: 100, threshold: 1.5 }
        });
        const counts = generateMockCounts(response.data.grievanceData);
        return { data: counts };
    } catch (error) {
        console.error('getPrimaryCount error:', error);
        return { data: { primary_count: 150 } }; // Fallback
    }
}

export const getFreshCount = async (ministry, from, to) => {
    console.log('getFreshCount called with:', { ministry, from, to });
    try {
        const response = await httpService.external.get('', {
            params: { query: 'grievance', value: 1, size: 100, threshold: 1.5 }
        });
        const counts = generateMockCounts(response.data.grievanceData);
        return { data: counts };
    } catch (error) {
        console.error('getFreshCount error:', error);
        return { data: { fresh_count: 50 } }; // Fallback
    }
}

export const getRepeatCount = async (ministry, from, to) => {
    console.log('getRepeatCount called with:', { ministry, from, to });
    try {
        const response = await httpService.external.get('', {
            params: { query: 'repeat grievance', value: 1, size: 100, threshold: 1.5 }
        });
        const counts = generateMockCounts(response.data.grievanceData);
        return { data: counts };
    } catch (error) {
        console.error('getRepeatCount error:', error);
        return { data: { repeat_count: 30 } }; // Fallback
    }
}

export const getSpamCount = async (ministry, from, to) => {
    console.log('getSpamCount called with:', { ministry, from, to });
    try {
        const response = await httpService.external.get('', {
            params: { query: 'spam', value: 1, size: 50, threshold: 1.5 }
        });
        const counts = generateMockCounts(response.data.grievanceData);
        return { data: counts };
    } catch (error) {
        console.error('getSpamCount error:', error);
        return { data: { spam_count: 10 } }; // Fallback
    }
}

export const getUrgentCount = async (ministry, from, to) => {
    console.log('getUrgentCount called with:', { ministry, from, to });
    try {
        const response = await httpService.external.get('', {
            params: { query: 'urgent', value: 1, size: 50, threshold: 1.5 }
        });
        const counts = generateMockCounts(response.data.grievanceData);
        return { data: counts };
    } catch (error) {
        console.error('getUrgentCount error:', error);
        return { data: { urgent_count: 25 } }; // Fallback
    }
}

export const getBarGraphData = async (ministry, from, to) => {
    console.log('getBarGraphData called with:', { ministry, from, to });
    try {
        const response = await httpService.external.get('', {
            params: { query: 'grievance', value: 1, size: 1000, threshold: 1.5 }
        });
        const barData = generateMockBarGraph(response.data.grievanceData);
        return { data: barData };
    } catch (error) {
        console.error('getBarGraphData error:', error);
        // Fallback bar data
        return { 
            data: [
                { state: 'Uttar Pradesh', count: 250 },
                { state: 'Maharashtra', count: 180 },
                { state: 'Bihar', count: 150 },
                { state: 'West Bengal', count: 120 },
                { state: 'Madhya Pradesh', count: 100 }
            ]
        };
    }
}

export const getLineGraphData = async (ministry, from, to) => {
    console.log('getLineGraphData called with:', { ministry, from, to });
    try {
        const response = await httpService.external.get('', {
            params: { query: 'grievance', value: 1, size: 1000, threshold: 1.5 }
        });
        const lineData = generateMockLineGraph(response.data.grievanceData);
        return { data: lineData };
    } catch (error) {
        console.error('getLineGraphData error:', error);
        // Fallback line data
        return { 
            data: [
                { date: '2025-01-01', count: 20 },
                { date: '2025-01-02', count: 25 },
                { date: '2025-01-03', count: 30 },
                { date: '2025-01-04', count: 28 },
                { date: '2025-01-05', count: 35 }
            ]
        };
    }
}

export const getRepeaters = async (from = defaultFrom, to = defaultTo, ministry = 'All', state = 'All', district = 'All', skip = 0, take = pageSize) => {
    console.log('getRepeaters called with:', { from, to, ministry, state, district, skip, take });
    try {
        const response = await httpService.external.get('', {
            params: {
                query: 'repeat',
                value: 1,
                size: take,
                skiprecord: skip,
                threshold: 1.5
            }
        });
        return getRepeatersMock(from, to, ministry, state, district, skip, take);
    } catch (error) {
        console.error('getRepeaters error:', error);
        return getRepeatersMock(from, to, ministry, state, district, skip, take);
    }
}

export default {
    getPrimaryCount,
    getFreshCount,
    getRepeatCount,
    getSpamCount,
    getUrgentCount,
    getBarGraphData,
    getLineGraphData,
    getRepeaters
};