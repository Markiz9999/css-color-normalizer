<script setup lang="ts">
defineProps<{ color: string }>();
</script>

<template>
  <div class="color-preview">
    <div class="transparency-background" />
    <div class="color" :style="{ 'background-color': color }" />
  </div>
</template>

<style scoped lang="scss">
.color-preview {
  position: relative;
  width: 50px;
  aspect-ratio: 1/1;

  .transparency-background,
  .color {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .transparency-background {
    background: center / 34% url('@/assets/transparent.jpeg') repeat;
  }

  .color {
    transition: background-color 0.2s ease-in-out;
  }
}
</style>
