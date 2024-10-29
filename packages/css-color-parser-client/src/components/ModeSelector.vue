<script setup lang="ts">
import SelectButton from 'primevue/selectbutton';
import { ColorParseMode } from 'css-color-parser';
import IconDark from './icons/IconDark.vue';
import IconLight from './icons/IconLight.vue';
import Tooltip from 'primevue/tooltip';

const value = defineModel({ default: ColorParseMode.Light });
defineOptions({
  directives: {
    Tooltip,
  },
});
</script>

<template>
  <SelectButton class="mode-selector" v-model="value" :options="[ColorParseMode.Light, ColorParseMode.Dark]" :allowEmpty="false">
    <template #option="slotProps">
      <div
        v-tooltip.bottom="{ value: slotProps.option === ColorParseMode.Light ? 'Light mode' : 'Dark mode', showDelay: 1000 }"
        class="icon-wrapper"
      >
        <IconLight v-if="slotProps.option === ColorParseMode.Light" class="icon light" />
        <IconDark v-else-if="slotProps.option === ColorParseMode.Dark" class="icon dark" />
      </div>
    </template>
  </SelectButton>
</template>

<style lang="scss">
.mode-selector {
  button {
    padding: 0;

    .icon-wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      padding: var(--p-togglebutton-padding);

      .icon {
        width: 18px;
        height: 18px;
        fill: var(--p-togglebutton-icon-color);
        transition: fill 0.2s ease;
      }
    }

    &:hover {
      .icon-wrapper {
        .icon {
          fill: var(--p-togglebutton-icon-hover-color);
        }
      }
    }
  }
}
</style>
