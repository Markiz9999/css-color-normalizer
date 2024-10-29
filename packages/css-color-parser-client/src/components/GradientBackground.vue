<script setup lang="ts">
import { computed } from 'vue';

const {
  colorFrom = 'red',
  colorMiddle = 'green',
  colorTo = 'blue',
} = defineProps<{ colorFrom?: string; colorMiddle?: string; colorTo?: string }>();

// to set random animation progress state
const animationDelay = `${-Math.random() * 105}s`;

const colorVars = computed(() => ({
  '--my-color-from-0': colorFrom,
  '--my-color-from-50': colorMiddle,
  '--my-color-from-100': colorTo,
  '--my-color-middle-0': colorTo,
  '--my-color-middle-50': colorFrom,
  '--my-color-middle-100': colorMiddle,
  '--my-color-to-0': colorMiddle,
  '--my-color-to-50': colorTo,
  '--my-color-to-100': colorFrom,
}));
</script>

<template>
  <div class="gradient-background" :style="colorVars">
    <div class="animated-background" :style="{ 'animation-delay': animationDelay }" />
  </div>
</template>

<style lang="scss" scoped>
@property --angle {
  inherits: false;
  initial-value: -45deg;
  syntax: '<angle>';
}

@property --color-0 {
  inherits: false;
  initial-value: transparent;
  syntax: '<color>';
}

@property --color-50 {
  inherits: false;
  initial-value: transparent;
  syntax: '<color>';
}

@property --color-100 {
  inherits: false;
  initial-value: transparent;
  syntax: '<color>';
}

.gradient-background {
  --angle: -45deg;
  --color-0: var(--my-color-from-0);
  --color-50: var(--my-color-from-50);
  --color-100: var(--my-color-from-100);

  width: 100%;
  height: 300px;

  .animated-background {
    width: 100%;
    height: 100%;
    animation:
      20s ease-in-out gradient-animation infinite alternate,
      30s ease-in-out background-animation infinite alternate,
      105s ease-in-out angle-animation infinite alternate;
    background: linear-gradient(var(--angle), var(--color-0) 0%, var(--color-50) 50%, var(--color-100) 100%);
    background-size: 200% 200%;
  }
}

@keyframes gradient-animation {
  0% {
    --color-0: var(--my-color-from-0);
    --color-50: var(--my-color-from-50);
    --color-100: var(--my-color-from-100);
  }

  50% {
    --color-0: var(--my-color-middle-0);
    --color-50: var(--my-color-middle-50);
    --color-100: var(--my-color-middle-100);
  }

  100% {
    --color-0: var(--my-color-to-0);
    --color-50: var(--my-color-to-50);
    --color-100: var(--my-color-to-100);
  }
}

@keyframes background-animation {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes angle-animation {
  0% {
    --angle: -45deg;
  }

  100% {
    --angle: 135deg;
  }
}
</style>
