<template>
  <h3 style="text-align:center;">{{ title }}</h3>
  <Chart type="line" :data="chartData" :options="chartOptions" class="h-30rem" />
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
      chartData.value = setChartData(props.data[0], props.data[1], props.data[2], props.data[3]);
      chartOptions.value = setChartOptions();
    } else {
      chartData.value = null;
      chartOptions.value = null;
    }
  })

  const setChartData = (x, y1, y2, z) => {
    const documentStyle = getComputedStyle(document.documentElement);
    const bgColor = z.map(ele => {
      return ele > 0 ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)'; 
    });
    return {
      labels: x,
      datasets: [
        {
          label: 'EPS Estimate',
          fill: false,
          yAxisID: 'y',
          borderColor: 'rgba(37, 150, 190)',
          borderWidth: 3,
          borderDash: [5, 5],
          data: y1
        },
        {
          label: 'Reported EPS',
          fill: true,
          yAxisID: 'y',
          borderColor: 'rgba(245, 246, 250,1.0)',
          tension: 0.4,
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          data: y2
        },
        {
          type: 'bar',
          label: 'Surprise (%)',
          fill: true,
          yAxisID: 'y1',
          data: z,
          backgroundColor: bgColor,
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
        stacked: false,
        maintainAspectRatio: false,
        //aspectRatio: 0.6,
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
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    drawOnChartArea: false,
                    color: surfaceBorder
                }
            }
        }
    };
}
</script>