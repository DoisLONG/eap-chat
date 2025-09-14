// src/services/sop.api.js
import axios from 'axios'

/**
 * 代理配置（vite.config.js）：
 * server: { proxy: { '/sop-api': {
 *   target: 'http://14.103.223.101:6007',
 *   changeOrigin: true,
 *   rewrite: p => p.replace(/^\/sop-api/, '')
 * }}}
 */
const api = axios.create({
  baseURL: '/sop-api',
  timeout: 60000,
})

// 生成 QA（支持多文件上传）
export async function generateQa(files, totalQaNum = 50) {
  const fd = new FormData()
  files.forEach(f => fd.append('files', f))
  fd.append('total_qa_num', totalQaNum)

  // 返回值 swagger 标成 string；后端一般会返回 task_id
  const res = await api.post('/v1/dataprep/generate_qa', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res // res.data 可能是任务ID
}

// 轮询任务状态
export async function getTaskStatus(taskId) {
  const res = await api.post('/v1/dataprep/task_status', { task_id: taskId })
  return res
}

/**
 * 轮询辅助：直到 judge 返回 true 或超时
 * @param {string} taskId
 * @param {{judge:(s:any)=>boolean, intervalMs:number, maxTimes:number}} opt
 */
export function pollTaskStatus(taskId, opt = {}) {
  const { judge = (s)=>String(s).toUpperCase()!=='PENDING', intervalMs = 2000, maxTimes = 120 } = opt
  return new Promise((resolve, reject) => {
    let times = 0
    const timer = setInterval(async () => {
      try {
        times++
        const { data } = await getTaskStatus(taskId)
        const status = typeof data === 'string' ? data : (data?.status ?? data)
        if (judge(status) || times >= maxTimes) {
          clearInterval(timer)
          resolve(status)
        }
      } catch (e) {
        clearInterval(timer)
        reject(e)
      }
    }, intervalMs)
  })
}

// 拉取 SOP 列表（POST /v1/dataprep/sops?user_id=xxx）
export async function getSops({ user_id = 'test_user' } = {}) {
  const res = await api.post(`/v1/dataprep/sops?user_id=${encodeURIComponent(user_id)}`)
  return res
}

// 拉取某个文件的 QA 列表（如果需要接入复核弹窗）
export const getQaList = (fileName) => {
    return api.post('/v1/dataprep/qa/list', JSON.stringify(fileName), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
// 保存 QA（复核完成后）
export async function saveQaList(fileName, records) {
  const res = await api.post('/v1/dataprep/qa/save', {
    file_name: fileName,
    records
  })
  return res
}

// 删除某个 SOP 文件
export async function deleteSop(fileName) {
  const res = await api.post('/v1/dataprep/delete_sop', { file_name: fileName })
  return res
}
