<template>
  <div class="grid">
    <!-- Form ## done--> 
    <div class="col-8 col-offset-2">
      <div class="formgroup-inline">
        <div class="field">
          <label>Ticker </label><InputText v-model="ticker.symbol" @keyup.enter="retrieveData"/>
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
    <!-- Technical indicators/metrics -->
    <div class="col-12">
      <MetricsCard title="Key Metrics" :metrics="stats.data" />
    </div>
    <!-- Table -->
    <div class="col-5">
      <DataTable :value="data" paginator :rows="30" :rowsPerPageOptions="[30, 60, 90, 120]">
        <template #header><div style="text-align: left"><Button disabled icon="pi pi-external-link" label="Export" /></div></template>
        <template #empty>No data found. </template>
        <template #loading>Loading data. Please wait. </template>
        <Column v-for="col of stock_columns" :field="col.field" :header="col.header" style="text-align: center"></Column>
      </DataTable>
    </div>
    <!-- Charts -->
    <div class="col-7">
      <div class="grid nested-grid">
        <div class="col-6"> <!-- Price Movement Historgram -->    
          <Histogram :title="histChart.title" :data="histChart.data" />
        </div>
        <div class="col-6"> <!-- Sentimental Donut -->
          <Donut :title="donutChart.title" :data="donutChart.data" />
        </div>
        <div class="col-12"> <!-- Percentage Change in Price -->
          <LineChart :title="lineChart.title" :data="lineChart.data" />
        </div>
        <div class="col-6"> <!-- Longest Streaks Pie -->
          <Pie :title="pieChart.title" :data="pieChart.data" />
        </div>
        <div class="col-6">
        </div>
      </div>
    </div>
  </div>
  <div class="grid">
    <div class="col-12">
      <h3 style="text-align:center;">SEC Form 4 Insider Trading </h3>
      <DataTable :value="insidertradesData" paginator :rows="30" :rowsPerPageOptions="[30, 60, 90, 120]">
        <template #header><div style="text-align: left"><Button disabled icon="pi pi-external-link" label="Export" /></div></template>
        <template #empty>No data found. </template>
        <template #loading>Loading data. Please wait. </template>
        <column v-for="col of insider_trades_columns" :field="col.field" :header="col.header" style="text-align: center"></column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { getHistoricalPrice, getMetrics } from '@/services/api';
  import { stock_columns, insider_trades_columns } from '@/components/Columns.js';
  import { formatDate, getHistogramValues } from '@/services/util';
  import { getInsiderTrades } from '@/services/insidertrades';

  const showError = ref(false);
  const errMsg = ref('');
  const data = ref();
  const insidertradesData = ref();
  const ticker = ref({
    symbol: 'AAPL',
    from: formatDate(new Date('2024-01-01')), 
    to: formatDate(new Date(Date.now())),
    frequency: 'Weekly'
  })

  const stats = ref({
    title: '',
    data: [],
  });

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

  const pieChart = ref({
    title: ''
  })

  const retrieveData = async () => {    
    try {
      // === retrieve the historical prices: START === //
      showError.value = false;
      let query = JSON.parse(JSON.stringify(ticker.value));
      query.from = formatDate(new Date(query.from));
      query.to = formatDate(new Date(query.to) + 1);
      const response = await getHistoricalPrice(query.symbol, query.from, query.to, 'W')
      data.value = response.data
      // console.log("Response: ", data.value)
      // === retrieve the historical prices: END === //

      // === retrieve the stats: START === // 
      const res = await getMetrics(query.symbol);
      stats.value.data = res.data;
      // retrieve the stats: END // 

      // === charting: START === // 
      // console.log(data.value);
      const diffs = data.value.map(item => item.diff);
      const dates = data.value.map(item => item.Date);
      const percentages = data.value.map(item => item.percentage);

      histChart.value.title = "Price Movement Histogram";
      histChart.value.data = diffs;
      donutChart.value.title = "Sentimental Donut";
      donutChart.value.data = diffs;
      lineChart.value.title = "Percentage Change in Price";
      lineChart.value.data = [dates.reverse(), percentages.reverse()];
      pieChart.value.title = "Longest Streaks"
      pieChart.value.data = diffs;

      // === charting: END === // 

      // === SEC Form 4 insider trading: START === //
      const insideTradesRes = await getInsiderTrades(query.symbol, query.from, query.to);
      insidertradesData.value = insideTradesRes.data;
      // === SEC Form 4 insider trading: END === //

    } catch (error) {
      console.log("Error: ", error);
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