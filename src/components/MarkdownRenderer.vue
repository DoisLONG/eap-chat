<template>
  <div class="markdown-body" v-html="compiled" />
</template>

<script setup>
import { marked } from 'marked'
import { ref, watch } from 'vue'

const props = defineProps({ content: String })
const compiled = ref('')

watch(
  () => props.content,
  (val) => {
    compiled.value = marked.parse(val || '')
  },
  { immediate: true }
)
</script>

<style scoped>
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}
.markdown-body p {
  margin: 0.4em 0;
}
.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  font-weight: bold;
  margin: 0.8em 0 0.3em;
}
.markdown-body ul {
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.markdown-body li {
  margin: 0.3em 0;
}
.markdown-body code {
  background-color: #f4f4f4;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}
.markdown-body pre code {
  display: block;
  background: #272822;
  color: #f8f8f2;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
}
</style>
