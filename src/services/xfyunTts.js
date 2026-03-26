// src/services/xfyunTts.js

// 内部测试可直接写死；正式环境不要前端暴露

import CryptoJS from "crypto-js";

// ===============================
// 直接替换成你自己的讯飞配置
// 仅建议内部测试环境使用
// ===============================
const XF_TTS_CONFIG = {
  appId: "cb2aa48e",
  apiKey: "212c9afc1037b2fbfd0808549f295437",
  apiSecret: "ZDdhOTc4NzlkN2FjMzZjNjY0MjQxNWQw",
  vcn: "x4_xiaoyan",
  speed: 50,
  pitch: 50,
  volume: 50,
};

const HOST = "tts-api.xfyun.cn";
const PATH = "/v2/tts";
const WS_URL = `wss://${HOST}${PATH}`;

// UTF-8 字符串转 Base64
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// RFC1123 时间
function toRFC1123Date() {
  return new Date().toUTCString();
}

// 使用 crypto-js 计算 HMAC-SHA256，再转 Base64
function hmacSha256Base64(secret, message) {
  const hash = CryptoJS.HmacSHA256(message, secret);
  return CryptoJS.enc.Base64.stringify(hash);
}

// 生成鉴权 URL
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

// Base64 音频片段 -> Uint8Array
function decodeAudioChunk(base64Audio) {
  const binary = atob(base64Audio);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

// 合成但不自动播放，返回 Audio 实例
export async function synthesizeXfyunTts(text, options = {}) {
  const finalText = String(text || "").trim();
  if (!finalText) {
    throw new Error("TTS text is empty");
  }

  const config = {
    ...XF_TTS_CONFIG,
    ...options,
  };

  if (!config.appId || !config.apiKey || !config.apiSecret) {
    throw new Error("请先配置讯飞 AppID / APIKey / APISecret");
  }

  const authUrl = createAuthUrl(config.apiKey, config.apiSecret);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(authUrl);
    const audioChunks = [];
    let closed = false;

    const safeClose = () => {
      if (!closed) {
        closed = true;
        try {
          ws.close();
        } catch {}
      }
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          common: {
            app_id: config.appId,
          },
          business: {
            aue: "lame",
            sfl: 1,
            auf: "audio/L16;rate=16000",
            vcn: config.vcn,
            tte: "UTF8",
            speed: config.speed,
            pitch: config.pitch,
            volume: config.volume,
          },
          data: {
            status: 2,
            text: utf8ToBase64(finalText),
          },
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data);

        if (res.code !== 0) {
          safeClose();
          reject(new Error(res.message || `TTS error: ${res.code}`));
          return;
        }

        const audio = res?.data?.audio;
        if (audio) {
          audioChunks.push(decodeAudioChunk(audio));
        }

        if (res?.data?.status === 2) {
          const blob = new Blob(audioChunks, { type: "audio/mpeg" });
          const blobUrl = URL.createObjectURL(blob);
          const player = new Audio(blobUrl);

          // 挂到实例上，外部统一释放
          player.__blobUrl = blobUrl;

          safeClose();
          resolve(player);
        }
      } catch (err) {
        safeClose();
        reject(err);
      }
    };

    ws.onerror = () => {
      safeClose();
      reject(new Error("讯飞 TTS WebSocket 连接失败"));
    };

    ws.onclose = () => {};
  });
}
