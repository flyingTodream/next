<template>
  <div class="vx-result">
    <div
      v-if="res"
      class="swal2-icon swal2-success swal2-animate-success-icon"
      style="display: block;"
    >
      <div class="swal2-success-circular-line-left" style="background: rgb(255, 255, 255);"></div>
      <span class="swal2-success-line-tip swal2-animate-success-line-tip"></span>
      <span class="swal2-success-line-long swal2-animate-success-line-long"></span>
      <div class="swal2-success-ring"></div>
      <div class="swal2-success-fix" style="background: rgb(255, 255, 255);"></div>
      <div class="swal2-success-circular-line-right" style="background: rgb(255, 255, 255);"></div>
    </div>

    <div
      v-if="!res"
      class="swal2-icon swal2-error swal2-animate-error-icon"
      style="display: block;"
    >
      <span class="swal2-x-mark swal2-animate-x-mark">
        <span class="swal2-x-mark-line-left"></span>
        <span class="swal2-x-mark-line-right"></span>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'vx-result',
  props: {
    res: {
      type: Boolean,
      default: false
    }
  }
}
</script>