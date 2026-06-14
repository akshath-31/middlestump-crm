import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

let pendingRequests = 0;
let timeoutId = null;

api.interceptors.request.use((config) => {
  pendingRequests++;
  if (pendingRequests === 1) {
    timeoutId = setTimeout(() => {
      window.dispatchEvent(new Event('backend-waking-up'));
    }, 15000);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    pendingRequests--;
    if (pendingRequests <= 0) {
      pendingRequests = 0;
      clearTimeout(timeoutId);
      window.dispatchEvent(new Event('backend-ready'));
    }
    return response;
  },
  (error) => {
    pendingRequests--;
    if (pendingRequests <= 0) {
      pendingRequests = 0;
      clearTimeout(timeoutId);
      window.dispatchEvent(new Event('backend-ready'));
    }
    return Promise.reject(error);
  }
);

export const getContext = () => api.get('/api/ai/context').then(res => res.data);
export const getOpportunities = () => api.get('/api/ai/opportunities').then(res => res.data);
export const analyzeCampaign = (goal) => api.post('/api/ai/analyze', { goal }).then(res => res.data);
export const confirmCampaign = (campaign_id) => api.post('/api/ai/confirm', { campaign_id }).then(res => res.data);
export const getCampaignStats = (id) => api.get(`/api/campaigns/${id}`).then(res => res.data);
export const getCampaignCommunications = (id) => api.get(`/api/campaigns/${id}/communications`).then(res => res.data);
export const getCampaignAudience = (id) => api.get(`/api/campaigns/${id}/audience`).then(res => res.data);
export const analyzeCampaignResults = (id) => api.post(`/api/ai/analyze-campaign/${id}`).then(res => res.data);
export const getCampaigns = () => api.get('/api/campaigns').then(res => res.data);
export const getShoppers = (params) => api.get('/api/shoppers', { params }).then(res => res.data);
export const getShopper = (id) => api.get(`/api/shoppers/${id}`).then(res => res.data);
export const getSegmentSummary = () => api.get('/api/shoppers/segments/summary').then(res => res.data);
export const getCampaignSummary = (id) => api.post(`/api/ai/summary/${id}`).then(res => res.data);
