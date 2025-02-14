<script setup lang="ts">
import ColorInput from '../components/ColorInput.vue';
import ColorPreview from '../components/ColorPreview.vue';
import InvalidColor from '../components/InvalidColor.vue';
import GradientBackgroundTransition from '@/components/GradientBackgroundTransition.vue';

import { computed, ref, watch } from 'vue';
import { Color, ColorParseMode, CssColorParser, type IColor } from 'css-color-parser';
import debounce from 'lodash/debounce';
import TransitionExpand from '@/components/TransitionExpand.vue';
import ModeSelector from '@/components/ModeSelector.vue';

const cssColor = ref<string>('');
const color = ref<IColor | null>(null);
const isColorFilledIn = ref(false);
const mode = ref<ColorParseMode>(ColorParseMode.Light);

const gradientFromColorHex = ref<string | null>(null);
const gradientMiddleColorHex = ref<string | null>(null);
const gradientToColorHex = ref<string | null>(null);

const parser = new CssColorParser();

const hexColor = computed(() => {
  return color.value?.toHexColorString();
});

const hexNumber = computed(() => {
  return color.value?.toHexNumberString();
});

const rgbaColor = computed(() => {
  return color.value?.toRgbColorString();
});

const isCssColorInvalid = computed(() => {
  return color.value == null && isColorFilledIn.value === true;
});

watch([cssColor, mode], () => {
  parse();
});

watch(color, () => {
  if (color.value == null) {
    gradientFromColorHex.value = null;
    gradientMiddleColorHex.value = null;
    gradientToColorHex.value = null;

    return;
  }

  const rDecreaseCount = Math.random() * 0.15 + 0.15;
  const gDecreaseCount = Math.random() * 0.15 + 0.15;
  const bDecreaseCount = Math.random() * 0.15 + 0.15;
  const rIncreaseCount = Math.random() * 0.15 + 0.15;
  const gIncreaseCount = Math.random() * 0.15 + 0.15;
  const bIncreaseCount = Math.random() * 0.15 + 0.15;

  const middleColor = new Color(
    1,
    Math.max(rDecreaseCount, Math.min(1 - rIncreaseCount, color.value.R)),
    Math.max(gDecreaseCount, Math.min(1 - gIncreaseCount, color.value.G)),
    Math.max(bDecreaseCount, Math.min(1 - bIncreaseCount, color.value.B)),
  );

  gradientFromColorHex.value = new Color(
    1,
    middleColor.R - rDecreaseCount,
    middleColor.G - gDecreaseCount,
    middleColor.B - bDecreaseCount,
  ).toHexColorString();

  gradientMiddleColorHex.value = middleColor.toHexColorString();

  gradientToColorHex.value = new Color(
    1,
    middleColor.R + rIncreaseCount,
    middleColor.G + gIncreaseCount,
    middleColor.B + bIncreaseCount,
  ).toHexColorString();
});

const parse = debounce(() => {
  try {
    color.value = parser.parse(cssColor.value, { mode: mode.value });
  } catch {
    color.value = null;
  }

  isColorFilledIn.value = cssColor.value.length > 0;
}, 500);
</script>

<template>
  <main class="home-view" :class="mode">
    <GradientBackgroundTransition
      :colorFrom="gradientFromColorHex ?? undefined"
      :colorMiddle="gradientMiddleColorHex ?? undefined"
      :colorTo="gradientToColorHex ?? undefined"
    />
    <section>
      <div class="card main">
        <h1>
          <span class="title">CSS Color Parser</span>
          <ModeSelector v-model="mode" />
        </h1>
        <ColorInput v-model="cssColor" :invalid="isCssColorInvalid" />
      </div>
      <TransitionExpand :rotate="true">
        <div v-if="isColorFilledIn === true" class="row-wrapper">
          <div class="row">
            <div class="card color-preview">
              <div class="wrapper">
                <transition name="fade">
                  <ColorPreview key="preview" v-if="hexColor != null" :color="hexColor" />
                  <InvalidColor key="error" v-else />
                </transition>
              </div>
            </div>
            <div class="card color-variants">
              <div>Number:</div>
              <div>
                <transition name="fade" mode="out-in">
                  <span :key="hexNumber">{{ hexNumber ?? '-' }}</span>
                </transition>
              </div>
              <div>HEX:</div>
              <div>
                <transition name="fade" mode="out-in">
                  <span :key="hexColor">{{ hexColor ?? '-' }}</span>
                </transition>
              </div>
              <div>RGB:</div>
              <div>
                <transition name="fade" mode="out-in">
                  <span :key="rgbaColor">{{ rgbaColor ?? '-' }}</span>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </TransitionExpand>
    </section>
  </main>
</template>

<style scoped lang="scss">
main.home-view {
  display: inline-flex;
  min-width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .gradient-background-transition {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  section {
    position: relative;
    z-index: 1;
    display: inline-flex;
    max-width: 450px;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(rgba(17, 17, 26, 0.1) 0 4px 16px) drop-shadow(rgba(17, 17, 26, 0.1) 0 8px 24px)
      drop-shadow(rgba(17, 17, 26, 0.1) 0 16px 56px);
    perspective: 750px;

    .card {
      z-index: 1;
      border-radius: 10px;
      background-color: var(--white);
      transition: background-color 0.2s ease;

      &.main,
      &.color-variants {
        width: 100%;
        padding: 20px;
      }

      &.main {
        flex-shrink: 0;
        margin-bottom: 10px;

        h1 {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          color: var(--p-text-color);
          font-size: 26px;
          text-wrap: nowrap;
        }

        .color-input {
          width: 100%;
          min-width: 250px;
        }
      }

      &.color-variants {
        display: grid;
        color: var(--p-text-color);
        grid-template-columns: auto auto;
        transition:
          color 0.2s ease,
          background-color 0.2s ease;

        div:nth-child(2n) {
          text-align: end;

          span {
            font-weight: bold;
          }
        }
      }

      &.color-preview {
        padding: 10px;

        .wrapper {
          position: relative;

          .color-preview,
          .invalid-color {
            overflow: hidden;
            width: auto;
            height: 100px;
            border-radius: 5px;
            aspect-ratio: 1/1;

            &.fade-leave-active {
              position: absolute;
              top: 0;
              left: 0;
            }
          }
        }
      }
    }

    .row-wrapper {
      display: flex;
      width: 100%;
      align-items: start;

      .row {
        display: flex;
        width: 100%;
        gap: 10px;
      }

      &.expand-rotate-enter-active,
      &.expand-rotate-leave-active {
        transition-duration: 0.5s;
      }
    }
  }

  &.dark {
    --p-text-color: var(--white);
    --p-inputtext-filled-background: var(--p-surface-600);
    --p-inputtext-filled-hover-background: var(--p-surface-600);
    --p-inputtext-filled-focus-background: var(--p-surface-600);
    --p-inputtext-color: var(--p-surface-100);
    --p-floatlabel-color: var(--p-surface-300);
    --p-floatlabel-active-color: var(--p-surface-300);
    --p-floatlabel-focus-color: var(--p-blue-200);
    --p-floatlabel-on-active-background: var(--p-surface-700);
    --p-inputtext-focus-border-color: var(--p-blue-200);

    // toggle variables
    --p-togglebutton-background: var(--p-surface-800);
    --p-togglebutton-checked-background: var(--p-surface-800);
    --p-togglebutton-hover-background: var(--p-surface-800);
    --p-togglebutton-border-color: var(--p-surface-800);
    --p-togglebutton-color: var(--p-surface-50);
    --p-togglebutton-hover-color: var(--p-surface-100);
    --p-togglebutton-checked-color: var(--p-surface-200);
    --p-togglebutton-checked-border-color: var(--p-surface-800);
    --p-togglebutton-content-checked-background: var(--p-surface-700);
    --p-togglebutton-icon-color: var(--p-surface-50);
    --p-togglebutton-icon-hover-color: var(--p-surface-100);
    --p-togglebutton-icon-checked-color: var(--p-surface-200);

    section {
      .card {
        background-color: var(--p-surface-700);
      }
    }
  }
}
</style>

<style lang="scss"></style>
