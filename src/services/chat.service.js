// src/services/chat.service.js
import axios from 'axios'

const chatApi = axios.create({
  baseURL: '/chatapi',
  timeout: 60000,
})

// 初始化考试会话
export function startExamSession({ user_id, file_name }) {
  return chatApi.post('/v1/exams/start', { user_id, file_name })
}

// 流式答题接口
export async function streamExamAnswer(body, onChunk) {
  const ctrl = new AbortController()
  window.__chatAbort = ctrl

  const res = await fetch('/chatapi/v1/exams/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: ctrl.signal,
  })

  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const text = decoder.decode(value, { stream: true })
    text.split('\n').forEach(line => {
      const s = line.replace(/^data:\s*/, '').trim()
      if (!s) return
      onChunk?.(s)
    })
  }
}
