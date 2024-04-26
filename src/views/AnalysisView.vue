<template>
  <div class="grid">
    <!-- Form ## done--> 
    <div class="col-8 col-offset-2">
      <div class="formgroup-inline">
        <div class="field">
          <label>Ticker </label><InputText v-model="ticker.symbol" />
        </div>
        <div class="field">
          <label>From </label> <Calendar v-model="ticker.from" dateFormat="yy-mm-dd" showButtonBar />
        </div>
        <div class="field">
          <label>To </label> <Calendar v-model="ticker.to" dateFormat="yy-mm-dd" showButtonBar />
        </div>     
        <div class="field">
          <label>Frequency </label> <Dropdown disabled v-model="ticker.frequency" :options="['Weekly', 'Monthly', 'Daily']" />
        </div>   
        <Button label="Go!" @click="retrieveData" />
      </div>
      <div class="col-12">
        <InlineMessage v-if="showError" severity="error">{{errMsg}}</InlineMessage>
      </div>

    </div>
  </div>
  <!-- Returns -->
  <div class="grid nested-grid">
    <!-- Table -->
    <div class="col-5">
      <DataTable :value="data" paginator :rows="25" :rowsPerPageOptions="[25, 55, 40, 50]">
        <template #header><div style="text-align: left"><Button disabled icon="pi pi-external-link" label="Export" /></div></template>
        <template #empty>No data found. </template>
        <template #loading>Loading data. Please wait. </template>
        <Column v-for="col of stock_columns" :field="col.field" :header="col.header" style="text-align: center"></Column>
      </DataTable>
    </div>
    <!-- Charts -->
    <div class="col-7">
      <div class="grid nested-grid">
        <div class="col-6">     
          <Histogram :title="histChart.title" :data="histChart.data" />
        </div>
        <div class="col-6">
          <Donut :title="donutChart.title" :data="donutChart.data" />
        </div>
        <div class="col-12">
          <LineChart :title="lineChart.title" :data="lineChart.data" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { getHistoricalPrice } from '@/services/api';
  import { stock_columns } from '@/components/columns.js';
  import { formatDate, getHistogramValues } from '@/services/util';

  const showError = ref(false);
  const errMsg = ref('');
  const data = ref();
  const ticker = ref({
    symbol: 'AAPL',
    from: '2024-01-01',
    to: formatDate(new Date()),
    frequency: 'Weekly'
  })


  const histChart = ref({
    title: '',
    data: [],
  });

  const donutChart = ref({
    title: '',
    data: [],
  })

  const lineChart = ref({
    title: '',
    data: [],
  })


  const retrieveData = async () => {    
    try {
      // retrieve the historical prices: START //
      showError.value = false;
      let query = JSON.parse(JSON.stringify(ticker.value));
      query.from = formatDate(query.from);
      query.to = formatDate(query.to);
      const response = await getHistoricalPrice(query.symbol, query.from, query.to, 'W')
      data.value = response.data
      // retrieve the historical prices: END //

      // charting: START // 
      const diffs = data.value.map(item => item.diff);
      const dates = data.value.map(item => item.Date);
      const percentages = data.value.map(item => item.percentage);
      histChart.value.title = "Price Movement Histogram";
      histChart.value.data = diffs;
      donutChart.value.title = "Sentimental Donut";
      donutChart.value.data = diffs;
      lineChart.value.title = "Percentage Change in Price";
      lineChart.value.data = [dates.reverse(), percentages.reverse()];
      // charting: END // 
    } catch (error) {
      showError.value = true;
      if (error.response != undefined) {
        if (error.response.data != undefined) {
          if (error.response.data.detail != undefined) {
            errMsg.value = error.response.data.detail;
          }
        }
      }
    }
  }


</script>