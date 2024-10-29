<script setup lang="ts">
import GradientBackground from './GradientBackground.vue';

const {
  colorFrom = 'red',
  colorMiddle = 'green',
  colorTo = 'blue',
} = defineProps<{ colorFrom?: string; colorMiddle?: string; colorTo?: string }>();
</script>

<template>
  <div class="gradient-background-transition">
    <transition name="fade">
      <GradientBackground
        :key="`${colorFrom}-${colorMiddle}-${colorTo}`"
        :colorFrom="colorFrom"
        :colorMiddle="colorMiddle"
        :colorTo="colorTo"
      />
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
