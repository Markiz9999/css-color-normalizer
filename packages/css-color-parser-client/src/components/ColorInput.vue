<script setup lang="ts">
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import TransitionExpand from './TransitionExpand.vue';

const model = defineModel<string>({ default: '' });
defineProps<{ invalid?: boolean }>();
</script>

<template>
  <FloatLabel class="color-input" variant="on">
    <IconField>
      <InputIcon><img src="@/assets/palette-small.png" class="icon" /></InputIcon>
      <InputText v-model="model" id="color-input" variant="filled" size="large" :invalid="invalid" />
    </IconField>
    <label for="color-input">Type your CSS color here</label>
    <TransitionExpand>
      <small v-if="invalid === true" class="error-message">Invalid or not supported CSS color</small>
    </TransitionExpand>
  </FloatLabel>
</template>

<style scoped lang="scss">
.color-input {
  --p-icon-size: 26px;

  .p-inputicon {
    .icon {
      width: 26px;
      height: 26px;
    }
  }

  .p-inputtext {
    width: 100%;
  }

  .error-message {
    display: block;
    margin-left: calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size));
    color: var(--p-red-400);
  }
}
</style>
