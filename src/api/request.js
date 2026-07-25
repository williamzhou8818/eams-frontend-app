// src/api/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

const request = axios.create({
  baseURL: 'http://52.6.191.36:8082', // 👈 确保这里是你后端的真实地址 //  http://52.6.191.36:8082
  timeout: 10000,
});

// ================= 1. 请求拦截器：自动携带 Token =================
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // 👇 核心：把 Token 放进请求头，后端拦截器就是来这里找的！
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ================= 2. 响应拦截器：处理 401 等错误 =================
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('employeeId');
      localStorage.removeItem('employeeName');
      localStorage.removeItem('department');
      router.push('/login');
    } else {
      ElMessage.error(error.message || '网络请求失败');
    }
    return Promise.reject(error);
  },
);

export default request;
