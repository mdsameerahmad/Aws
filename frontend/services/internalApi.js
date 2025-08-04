const axios = require('axios');

const internalAPI = axios.create({
  baseURL: process.env.ADMIN_SERVICE_URL,
});

internalAPI.interceptors.request.use(config => {
  // inject auth token if needed
  return config;
});

module.exports = internalAPI;