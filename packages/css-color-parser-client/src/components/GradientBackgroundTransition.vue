<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import GradientBackground from './GradientBackground.vue';

const {
  colorFrom = 'red',
  colorMiddle = 'green',
  colorTo = 'blue',
} = defineProps<{ colorFrom?: string; colorMiddle?: string; colorTo?: string }>();

const updatedAt = ref<string>(new Date().toString());

const key = computed(() => `${colorFrom}-${colorMiddle}-${colorTo}-${updatedAt.value}`);

watch(
  () => ({
    colorFrom,
    colorMiddle,
    colorTo,
  }),
  () => {
    updatedAt.value = new Date().toString();
  },
  { immediate: true },
);
</script>

<template>
  <div class="gradient-background-transition">
    <transition name="fade">
      <GradientBackground :key="key" :colorFrom="colorFrom" :colorMiddle="colorMiddle" :colorTo="colorTo" />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.gradient-background-transition {
  position: relative;

  .gradient-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    &.fade-enter-active,
    &.fade-leave-active {
      transition-duration: 2s;
      transition-timing-function: linear;
    }

    &.fade-leave-active {
      transition-delay: 2s;
    }
  }
}
</style>
