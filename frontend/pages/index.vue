<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">
      Welcome to Nuxt 4! 🚀
    </h1>
    <p class="text-xl text-gray-600 mb-8">
      A modern, full-stack Vue.js framework with the latest features.
    </p>
    <div class="space-x-4">
      <button class="btn" @click="showAlert">
        Click me!
      </button>
      <NuxtLink to="/about" class="btn btn-secondary">
        Learn More
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const showAlert = () => {
  alert('Hello from Nuxt 4! 🎉')
}
</script>
