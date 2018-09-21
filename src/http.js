import axios from 'axios';
import { hasIn } from 'lodash';

const axiosClient = () => axios.create({
  headers: {
    'content-type': 'application/json',
  },
});

let httpClient;

export const init = ({ baseURL, httpClient: configuredHttpClient }) => {
  httpClient = configuredHttpClient || axiosClient();
  httpClient.defaults.baseURL = baseURL;
};

export const setHttpRequestHeader = (header, value) => {
  httpClient.defaults.headers[header] = value;
};

const apiMethod = ({ method }) => method || 'get';
const apiUrl = ({ url, urlBuilder }, params) => (
  urlBuilder && params ? urlBuilder(url, params) : url
);

export const httpRequest = async (apiConfig, params) => {
  const url = apiUrl(apiConfig, params);
  const method = apiMethod(apiConfig);
  const res = await httpClient[method](url, params);
  return res;
};


export const extractErrorMessage = (error) => {
  if (hasIn(error, 'response.data.message')) {
    return error.response.data.message;
  }
  if (hasIn(error, 'request._response')) {
    /* eslint-disable no-underscore-dangle */
    return error.request._response;
  }
  if (error.message) {
    return error.message;
  }
  return error.toString();
};
