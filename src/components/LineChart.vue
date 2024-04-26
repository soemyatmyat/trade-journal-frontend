<template>
  <h3 style="text-align:center;">{{ title }}</h3>
  <Chart type="line" :data="chartData" :options="chartOptions"/>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import Chart from 'primevue/chart';
  import { getHistogramValues } from '@/services/util';

  const chartData = ref();
  const chartOptions = ref();
  const props = defineProps({
    title: String,
    data: Array,
  });

  watch(props, (newValue, oldValue) => {
    chartData.value = setChartData(props.data[0], props.data[1]);
    chartOptions.value = setChartOptions();
  })

  const setChartData = (x, y) => {
    return {
        labels: x,
        datasets: [
            {
                data: y,
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
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
  }

</script>