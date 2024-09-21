<template>
  <div>
    Фільтр:
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value.trim())"
      class="block pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
    />
    <div v-if="modelValue == ''">
      <button
        v-if="filteredList.length === 6"
        @click="$emit('on-next-page')"
        class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Вперед
      </button>
      <button
        v-if="page > 1"
        @click="$emit('on-previous-page')"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Назад
      </button>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['update:modelValue', 'on-next-page', 'on-previous-page'],
  props: {
    modelValue: {
      type: String
    },
    filteredList: {
      type: Array
    },
    page: {
      type: Number
    }
  }
};
</script>
