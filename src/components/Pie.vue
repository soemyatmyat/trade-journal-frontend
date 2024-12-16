<template>
  <h3 style="text-align: center;">{{ title }}</h3>
  <Chart type="pie" :data="chartData" :options="chartOptions" class="h-30rem" />
</template>

<script setup>
  import { ref, watch } from 'vue';
  import Chart from 'primevue/chart';
  import { getStreakValues } from '@/services/util';

  const chartData = ref();
  const chartOptions = ref();
  const props = defineProps({
    title: String,
    data: Array,
  });

  watch(props, (newValue, oldValue) => {
    chartData.value = setChartData(props.data);
    chartOptions.value = setChartOptions();
  })

  const setChartData = (diffs) => {
    const maxStreaks = getStreakValues(diffs);
    return {
        labels: ['Negative', 'Neutral', 'Positive'],
        datasets: [
            {
                data: maxStreaks,
                backgroundColor: ['rgba(255, 99, 132, 0.5)','rgba(255, 151, 39, 0.5)','rgba(54, 162, 235, 0.5)'],
            }
        ]
    };
  };

  const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            
        }
    };
  }

</script>