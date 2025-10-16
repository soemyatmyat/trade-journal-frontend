<template>
  <Card>
    <template #content>
    <ul class="metrics-list">
      <li v-for="(value, label) in formattedMetrics" :key="label">
        <span class="label">{{ label }}</span>
        <span class="value">{{ value || 'N/A' }}</span>
      </li>
    </ul>
    </template> 
  </Card>
</template>

<script setup>
  import { computed } from 'vue';
  const props = defineProps({
    title: String,
    metrics: Object
  });

  // Function to format the labels
  const formatLabel = (label) => {
    if (label === label.toUpperCase()) 
      return label; // Return the label as is if it's all uppercase
    return label
      .replace(/([A-Z])/g, ' $1') // Add a space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
      .trim(); // Trim any extra spaces
  };

  // Helper: convert ISO string to local date
  const formatDate = (value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      const date = new Date(value);
      //return date.toLocaleDateString(); // returns date only in user's timezone
      return date.toLocaleDateString("en-CA"); // returns date only in user's timezone in "en-CA" (Canada English) uses ISO-like YYYY-MM-DD format // need to revisit this //todo
    }
    return value;
  };

  const keysToSkip = new Set(["symbol", "earningsHistory"]);

  const formattedMetrics = computed(() => {
    return Object.entries(props.metrics).reduce((acc, [key, value]) => {
      if (keysToSkip.has(key)) return acc;
      acc[formatLabel(key)] = formatDate(value); // format ISO dates
      return acc;
    }, {});
  });

  // // Create a computed property for formatted metrics
  // const formattedMetrics = computed(() => {
  //   // Get the keys of the metrics object
  //   const keys = Object.keys(props.metrics);

  //   // Create a new object, omitting the first entry and the last entry
  //   return keys.slice(0, -1).reduce((acc, key) => {
  //     acc[formatLabel(key)] = props.metrics[key];
  //     return acc;
  //   }, {});
  // });


</script>

<style scoped>
  .p-card .p-card-content {
    padding: 0;
  }

  .metrics-list {
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    padding: 0;
  }

  .metrics-list li {
    flex: 1 1 20%; /* 4 columns */
    display: flex;
    justify-content: space-between;
    padding-right: 20px;

  }

  .label {
    font-weight: bold;
    margin-right: 10px;
  }
</style>
