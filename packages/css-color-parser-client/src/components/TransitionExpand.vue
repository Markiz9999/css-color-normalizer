<script setup lang="ts">
import { Transition, TransitionGroup } from 'vue';

const {
  type = 'transition',
  tag = 'div',
  direction = 'vertical',
  rotate = false,
} = defineProps<{ type?: 'transition' | 'transition-group'; tag?: string; direction?: 'vertical' | 'horizontal'; rotate?: boolean }>();

function afterEnter(element: HTMLElement) {
  if (direction === 'vertical') {
    element.style.height = 'auto';
  } else {
    element.style.width = 'auto';
  }
}

function enter(element: HTMLElement) {
  const styleName = direction === 'vertical' ? 'height' : 'width';

  element.style[styleName] = 'auto';
  const styleValue = getComputedStyle(element)[styleName];

  element.style[styleName] = '0';

  requestAnimationFrame(() => {
    element.style[styleName] = styleValue;
  });
}

function leave(element: HTMLElement) {
  const styleName = direction === 'vertical' ? 'height' : 'width';

  const styleValue = getComputedStyle(element)[styleName];
  element.style[styleName] = styleValue;

  requestAnimationFrame(() => {
    element.style[styleName] = '0';
  });
}
</script>

<template>
  <component
    :is="type === 'transition' ? Transition : TransitionGroup"
    :name="direction === 'vertical' ? (rotate === true ? 'expand-rotate' : 'expand') : 'expand-horizontal'"
    :tag="type === 'transition-group' ? tag : undefined"
    :class="direction"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
* {
  backface-visibility: hidden;

  &.vertical {
    will-change: height;
  }

  &.horizontal {
    will-change: width;
  }
}
</style>
