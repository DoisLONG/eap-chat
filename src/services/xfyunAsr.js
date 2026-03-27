// src/services/xfyunAsr.js
import CryptoJS from "crypto-js";

// ===============================
// 直接替换成你自己的讯飞配置
// 仅建议内部测试环境使用
// ===============================
const XF_ASR_CONFIG = {
  appId: "cb2aa48e",
  apiKey: "212c9afc1037b2fbfd0808549f295437",
  apiSecret: "ZDdhOTc4NzlkN2FjMzZjNjY0MjQxNWQw",
  language: "zh_cn", // zh_cn / en_us
  domain: "iat",
  accent: "mandarin",
  eos: 2000,
  ptt: 1,
  vad_eos: 2000,
  sampleRate: 16000,
  frameBytes: 1280, // 40ms @ 16k pcm16 mono = 16000 * 2 * 0.04 = 1280
  frameInterval: 40,
};

const HOST = "iat-api.xfyun.cn";
const PATH = "/v2/iat";
const WS_URL = `wss://${HOST}${PATH}`;

function toRFC1123Date() {
  return new Date().toUTCString();
}

function hmacSha256Base64(secret, message) {
  const hash = CryptoJS.HmacSHA256(message, secret);
  return CryptoJS.enc.Base64.stringify(hash);
}

function createAuthUrl(apiKey, apiSecret) {
  const date = toRFC1123Date();

  const signatureOrigin =
    `host: ${HOST}\n` +
    `date: ${date}\n` +
    `GET ${PATH} HTTP/1.1`;

  const signature = hmacSha256Base64(apiSecret, signatureOrigin);

  const authorizationOrigin =
    `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

  const authorization = btoa(authorizationOrigin);

  const params = new URLSearchParams({
    authorization,
    date,
    host: HOST,
  });

  return `${WS_URL}?${params.toString()}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uint8ToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...sub);
  }

  return btoa(binary);
}

function mergeChannels(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;

  if (channelCount === 1) {
    return audioBuffer.getChannelData(0);
  }

  const result = new Float32Array(length);
  for (let ch = 0; ch < channelCount; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      result[i] += data[i] / channelCount;
    }
  }

  return result;
}

function resampleFloat32(input, inputSampleRate, outputSampleRate) {
  if (inputSampleRate === outputSampleRate) {
    return input;
  }

  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.round(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const position = i * ratio;
    const left = Math.floor(position);
    const right = Math.min(left + 1, input.length - 1);
    const weight = position - left;
    output[i] = input[left] * (1 - weight) + input[right] * weight;
  }

  return output;
}

function floatTo16BitPCM(float32Array) {
  const output = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  return new Uint8Array(output.buffer);
}

async function blobTo16kMonoPCM(blob, targetSampleRate = 16000) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("当前环境不支持 AudioContext");
  }

  const audioContext = new AudioCtx();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const mono = mergeChannels(audioBuffer);
    const resampled = resampleFloat32(
      mono,
      audioBuffer.sampleRate,
      targetSampleRate,
    );
    return floatTo16BitPCM(resampled);
  } finally {
    try {
      await audioContext.close();
    } catch {}
  }
}

function splitFrames(bytes, frameBytes) {
  const frames = [];
  for (let i = 0; i < bytes.length; i += frameBytes) {
    frames.push(bytes.subarray(i, Math.min(i + frameBytes, bytes.length)));
  }
  return frames;
}

function extractTextFromResult(result) {
  const ws = result?.ws || [];
  return ws
    .map((item) => {
      const cw = item?.cw || [];
      return cw[0]?.w || "";
    })
    .join("");
}

function buildFinalText(segmentMap) {
  return Array.from(segmentMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, text]) => text)
    .join("");
}

export async function transcribeXfyunAsr(blob, options = {}) {
  const config = {
    ...XF_ASR_CONFIG,
    ...options,
  };

  if (!config.appId || !config.apiKey || !config.apiSecret) {
    throw new Error("请先配置讯飞 AppID / APIKey / APISecret");
  }

  const pcmBytes = await blobTo16kMonoPCM(blob, config.sampleRate);
  const frames = splitFrames(pcmBytes, config.frameBytes);

  if (!frames.length) {
    throw new Error("录音内容为空");
  }

  const authUrl = createAuthUrl(config.apiKey, config.apiSecret);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(authUrl);
    const segments = new Map();
    let closed = false;
    let resolved = false;

    const safeClose = () => {
      if (!closed) {
        closed = true;
        try {
          ws.close();
        } catch {}
      }
    };

    const finish = (text) => {
      if (resolved) return;
      resolved = true;
      safeClose();
      resolve(text);
    };

    const fail = (err) => {
      if (resolved) return;
      resolved = true;
      safeClose();
      reject(err);
    };

    ws.onopen = () => {
      (async () => {
        try {
          // 第一帧
          ws.send(
            JSON.stringify({
              common: {
                app_id: config.appId,
              },
              business: {
                language: config.language,
                domain: config.domain,
                accent: config.accent,
                eos: config.eos,
                ptt: config.ptt,
              },
              data: {
                status: 0,
                format: `audio/L16;rate=${config.sampleRate}`,
                encoding: "raw",
                audio: uint8ToBase64(frames[0]),
              },
            }),
          );

          // 中间帧
          for (let i = 1; i < frames.length; i++) {
            await sleep(config.frameInterval);
            ws.send(
              JSON.stringify({
                data: {
                  status: 1,
                  format: `audio/L16;rate=${config.sampleRate}`,
                  encoding: "raw",
                  audio: uint8ToBase64(frames[i]),
                },
              }),
            );
          }

          // 结束帧
          await sleep(config.frameInterval);
          ws.send(
            JSON.stringify({
              data: {
                status: 2,
              },
            }),
          );
        } catch (err) {
          fail(err);
        }
      })();
    };

    ws.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data);

        if (res.code !== 0) {
          fail(new Error(res.message || `ASR error: ${res.code}`));
          return;
        }

        const result = res?.data?.result;
        if (result) {
          const sn = Number(result.sn ?? segments.size);
          const text = extractTextFromResult(result);
          if (text) {
            segments.set(sn, text);
          }
        }

        const finalText = buildFinalText(segments);
        options.onProgress?.(finalText, res);

        if (res?.data?.status === 2 || result?.ls === true) {
          finish(finalText);
        }
      } catch (err) {
        fail(err);
      }
    };

    ws.onerror = () => {
      fail(new Error("讯飞 ASR WebSocket 连接失败"));
    };

    ws.onclose = () => {
      if (!resolved) {
        const finalText = buildFinalText(segments);
        if (finalText) {
          resolve(finalText);
        } else {
          reject(new Error("讯飞 ASR 连接已关闭"));
        }
      }
    };
  });
}
