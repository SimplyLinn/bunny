import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8082/',
  timeout: 3000,
});

instance.interceptors.response.use(function (response) {
  // Do something before request is sent
  return response;
}, function (error, ...args) {
  // Do something with request error
  console.error('INTERCETPION ERROR');
  console.dir(error);
  return Promise.reject(error);
});

export default instance;