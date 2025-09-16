import axios from "axios";
import { getUser, logout, useFilter } from '@/context/UserContext'
// import { useContext } from "react";
// import { useNavigate } from "react-router-dom";

// const navigate = useNavigate()
const env = import.meta.env

var baseURL = "localhost"

if (env.VITE_BASE_URL && env.VITE_DEV_BASE_URL) {
  if (env.VITE_ENVIRONMENT && env.VITE_ENVIRONMENT == 'dev')
    baseURL = env.VITE_DEV_BASE_URL
  else
    baseURL = env.VITE_BASE_URL
}
else if (env.VITE_BASE_URL)
  baseURL = env.VITE_BASE_URL
else if (env.VITE_DEV_BASE_URL)
  baseURL = env.VITE_DEV_BASE_URL

const instance = axios.create({
  baseURL: baseURL,

  timeout: 30_00_000,
  // withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    // 'token': localStorage.getItem("token"),
  },
});

const handleCatch = (error, reject) => {
  if (error.response?.status == 401) {
    logout()
  }
  console.log(error)
  reject(error)
}

const get = (route, config = {}) => {
  return new Promise((resolve, reject) => {
    if (config.params && Object.values(config.params).length > 0)
      route += '/'

    return instance.get(route, config)
      .then(response => resolve(response))
      .catch(error => handleCatch(error, reject))
  })
}

const post = (route, params, config = {}) => {
  return new Promise((resolve, reject) => {
    if (config.params && Object.values(config.params).length > 0)
      route += '/'

    return instance.post(route, params, config)
      .then(response => resolve(response))
      .catch(error => handleCatch(error, reject))
  })
}

// Add authentication to the config
const auth = (config = {}) => {
  let user = getUser()
  config.headers = {
    ...(config.headers || {}),
    ...{
      'Authorization': `Bearer ${user.accessToken}`
    }
  }

  return config
}

const httpService = {
  // setJWT,
  get: get,
  post: post,
  put: instance.put,
  delete: instance.delete,
  baseURL: baseURL,
  auth: {
    get: (route, config) => get(route, auth(config)),
    post: (route, params, config) => post(route, params, auth(config))
  },
  external: {
    get: async (route, config = {}) => {
      const params = config.params || {};
      // Ensure numeric params are numbers
      const cleanParams = {
        query: params.query || 'grievance',
        value: parseInt(params.value) || 1,
        skiprecord: parseInt(params.skiprecord) || 0,
        size: parseInt(params.size) || 20,
        threshold: parseFloat(params.threshold) || 1.5
      };
      
      // Build proxied URL - Vite will proxy /api/cdis to external server
      const searchParams = new URLSearchParams(cleanParams);
      const proxiedUrl = `/api/cdis/consumer_api/search/?${searchParams.toString()}`;
      
      console.log('External API proxied URL:', proxiedUrl);
      
      try {
        const response = await fetch(proxiedUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('External API response:', data);
        
        // Return axios-like response structure
        return {
          data: data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: { url: proxiedUrl }
        };
      } catch (error) {
        console.error('External API fetch error:', error);
        // Fallback to mock data for development
        if (error.message.includes('NetworkError') || error.message.includes('CORS') || error.name === 'TypeError') {
          console.warn('Using mock data due to network/CORS error');
          return {
            data: {
              total_count: { count: 150 },
              grievanceData: Array.from({length: 20}, (_, i) => ({
                id: `mock_${i + 1}`,
                complaintType: ['Complaint', 'Query', 'Feedback'][i % 3],
                companyName: ['Amazon', 'Flipkart', 'Reliance', 'Tata', 'Others'][Math.floor(i / 4)],
                categoryCode: 100 + i,
                stateName: ['Uttar Pradesh', 'Maharashtra', 'Bihar', 'West Bengal', 'Delhi'][Math.floor(i / 4)],
                CityName: ['Lucknow', 'Mumbai', 'Patna', 'Kolkata', 'New Delhi'][Math.floor(i / 4)],
                complaintDetails: `Mock consumer ${['complaint', 'query', 'feedback'][i % 3]} about ${['product quality', 'delivery delay', 'billing issue', 'service problem'][Math.floor(i / 5)]} for ${i + 1}`,
                complaintRegDate: new Date(Date.now() - i * 86400000).toISOString()
              }))
            },
            status: 200,
            statusText: 'OK (Mock)',
            headers: {},
            config: { url: proxiedUrl }
          };
        }
        throw error;
      }
    }
  }
};

export default httpService;