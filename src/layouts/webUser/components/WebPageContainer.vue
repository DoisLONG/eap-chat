<template>
  <div class="web-page-container">
    <slot />
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
.web-page-container {
  box-sizing: border-box;
  width: min(100%, var(--web-content-max-width));
  margin: 0 auto;
  padding: 28px;
}
</style>
