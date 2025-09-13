// src/services/chat.service.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/monitor-api', // ★ 按需更改：如 /chat-api
  timeout: 60000,
})

/**
 * 非流式：后端返回 { content: string }
 * body: { model, temperature, messages: [{ role, content }] }
 */
export function sendChat(body) {
  return api.post('/chat', body)
}

/**
 * 流式：SSE/Fetch 方式。后端若支持 text/event-stream：
 * handler(chunkStr) 将被多次调用
 */
export async function streamChat(body, onChunk) {
  const ctrl = new AbortController()
  // 暴露一个全局引用，便于前端“停止”按钮调用
  window.__chatAbort = ctrl

  const res = await fetch('/monitor-api/chat/stream', {
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
    // 后端可直接推字串；若是 SSE 形如 "data: xxx\n\n" 则需做 parse
    // 这里简单拆分
    text.split('\n').forEach(line => {
      const s = line.replace(/^data:\s*/, '').trim()
      if (!s) return
      onChunk?.(s)
    })
  }
}
