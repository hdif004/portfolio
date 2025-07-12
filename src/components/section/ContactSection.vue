<template>
  <section id="contact" class="py-20 px-6 w-10/12 mx-auto">
    <h2 class="text-3xl font-bold mb-6 text-primary">Contact</h2>
    <form class="space-y-6">
      <div>
        <label class="block text-sm mb-1" for="name">Name</label>
        <input
          type="text"
          id="name"
          class="w-full px-4 py-2 border rounded bg-background text-text"
        />
      </div>
      <div>
        <label class="block text-sm mb-1" for="email">Email</label>
        <input
          type="email"
          id="email"
          class="w-full px-4 py-2 border rounded bg-background text-text"
        />
      </div>
      <div>
        <label class="block text-sm mb-1" for="message">Message</label>
        <textarea
          id="message"
          rows="5"
          class="w-full px-4 py-2 border rounded bg-background text-text"
        ></textarea>
      </div>
      <button
        type="submit"
        class="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition"
      >
        Send Message
      </button>
    </form>
  </section>
</template>

<script setup></script>
