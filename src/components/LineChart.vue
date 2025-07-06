<template>
  <h3 style="text-align:center;">{{ title }}</h3>
  <Chart type="bar" :data="chartData" :options="chartOptions"/>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import Chart from 'primevue/chart';

  const chartData = ref();
  const chartOptions = ref();
  const props = defineProps({
    title: String,
    data: Array,
  });

  watch(props, (newValue, oldValue) => {
    if (props.data.length > 0) {
      chartData.value = setChartData(props.data[0], props.data[1]);
      chartOptions.value = setChartOptions();
    } else {
      chartData.value = null;
      chartOptions.value = null;
    }
  })

  const setChartData = (x, y) => {
    let cumulativeSum = 0;
    const cumulative_y = y.map(value => cumulativeSum += value);
    
    const bgColor = y.map(ele => {
      return ele > 0 ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)'; 
    });
    return {
        labels: x,
        datasets: [
            {   
                type: 'bar',
                data: y,
                label: 'Weekly',
                backgroundColor: bgColor,
            },
            {
                type: 'line',
                data: cumulative_y,
                label: 'Cumulative',
                borderColor: 'rgba(249, 180, 45)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
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