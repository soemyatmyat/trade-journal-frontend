<template>
  <h3 style="text-align:center;">{{ title }}</h3>
  <Chart type="bar" :data="chartData" :options="chartOptions" class="h-30rem" />
</template>

<script setup>
  import { ref, watch } from 'vue';
  import Chart from 'primevue/chart';
  import { getHistogramValues } from '@/services/util';

  const chartData = ref();
  const chartOptions = ref();
  const props = defineProps({
    title: String,
    data: Array
  });

  watch(props, (newValue, oldValue) => {
    chartData.value = setChartData(props.data);
    chartOptions.value = setChartOptions();

  })

  const setChartData = (diffs) => {
    console.log(diffs);
    const { binEdges, frequency, binWidth } = getHistogramValues(diffs);
    const bgColor = binEdges.map(ele => {
      return ele > 0 ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)'; 
    });
    return {
        labels: binEdges,
        datasets: [
            {
                label: 'Bin width of ' + binWidth,
                data: frequency,
                backgroundColor: bgColor, // red for - values, blue for + values
                borderWidth: 1,
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
      maintainAspectRatio: false,
      aspectRatio: 0.6,
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