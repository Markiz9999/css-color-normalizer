<script setup lang="ts">
import IconError from './icons/IconError.vue';
</script>

<template>
  <div class="invalid-color">
    <div class="transparency-background" />
    <div class="icon-wrapper">
      <IconError class="icon" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.invalid-color {
  position: relative;
  width: 50px;
  aspect-ratio: 1/1;

  .transparency-background,
  .icon-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      width: 50%;
      height: 50%;
    }
  }

  .transparency-background {
    background: center / 34% url('@/assets/transparent.jpeg') repeat;
  }
}
</style>
