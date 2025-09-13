import axios from 'axios';

const HOST = '/api-153';

// 1. 分页查询 License
export function fetchLicensePage(params) {
  return axios.get(`${HOST}/license/page`, { params });
}

// 2. 获取 License 详情
export function fetchLicenseDetail(id) {
  return axios.get(`${HOST}/license/${id}`);
}

// 3. 更新 License 状态
export function updateLicenseStatus(id, data) {
  return axios.patch(`${HOST}/license/${id}`, data);
}

// 4. 创建 License
export function createLicense(data) {
  return axios.post(`${HOST}/license`, data);
}
