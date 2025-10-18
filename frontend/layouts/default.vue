<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="container">
        <div class="flex justify-between items-center py-6">
          <h1 class="text-2xl font-bold text-gray-900">
            <NuxtLink to="/">Nuxt 4 App</NuxtLink>
          </h1>
          <nav class="space-x-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">Home</NuxtLink>
            <NuxtLink to="/about" class="text-gray-600 hover:text-gray-900">About</NuxtLink>
          </nav>
        </div>
      </div>
    </header>
    
    <main class="container py-8">
      <slot />
    </main>
    
    <footer class="bg-gray-800 text-white py-8">
      <div class="container text-center">
        <p>&copy; 2024 Nuxt 4 Frontend. Built with ❤️</p>
      </div>
    </footer>
  </div>
</template>
