function mergeChannels(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;

  if (channelCount === 1) return audioBuffer.getChannelData(0);

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
  if (inputSampleRate === outputSampleRate) return input;

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
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return new Uint8Array(output.buffer);
}

async function blobTo16kMonoPCM(blob) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error("当前环境不支持 AudioContext");

  const audioContext = new AudioCtx();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const mono = mergeChannels(audioBuffer);
    const resampled = resampleFloat32(mono, audioBuffer.sampleRate, 16000);
    return floatTo16BitPCM(resampled);
  } finally {
    try {
      await audioContext.close();
    } catch {}
  }
}

async function parseVoiceExamResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `HTTP ${res.status}`);
  }
  return data;
}

export async function talkVoiceExam(sessionId, blob) {
  const pcmBytes = await blobTo16kMonoPCM(blob);
  const res = await fetch(
    `/voiceapi/api/voice-exam/talk?session_id=${encodeURIComponent(sessionId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: pcmBytes,
    },
  );
  return parseVoiceExamResponse(res);
}

export async function sendVoiceExamText(sessionId, text) {
  const res = await fetch("/voiceapi/api/voice-exam/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      text,
    }),
  });
  return parseVoiceExamResponse(res);
}

export async function finishVoiceExam(sessionId) {
  const res = await fetch("/voiceapi/api/voice-exam/finish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      text: "结束考试",
    }),
  });
  return parseVoiceExamResponse(res);
}
