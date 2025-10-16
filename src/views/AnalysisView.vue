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
    <!-- Spinner -->
    <div class="col-12 text-center" v-if="isLoading">
      <div class="spinner-border text-primary" role="status">
        <ProgressSpinner style="width: 50px; height: 50px;" />
        <span class="text-center">Loading...</span>
      </div>
    </div>
    <!-- Technical indicators/metrics -->
    <div class="col-12" v-if="stats.data && Object.keys(stats.data).length">
      <MetricsCard title="Key Metrics" :metrics="stats.data" />
    </div>
    <!-- Table -->
    <div class="col-5" v-if="data">
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
        <div class="col-6" > <!-- Price Movement Historgram -->    
          <Histogram :title="histChart.title" :data="histChart.data" />
        </div>
        <div class="col-6" > <!-- Sentimental Donut -->
          <Donut :title="donutChart.title" :data="donutChart.data" />
        </div>
        <div class="col-12" > <!-- Percentage Change in Price -->
          <LineChart :title="lineChart.title" :data="lineChart.data" />
        </div>
        <div class="col-6"> <!-- Earnings vs. Expectations Dual Axis -->
          <DualAxis :title="dualAxisChart.title" :data="dualAxisChart.data" />
        </div>
        <div class="col-6"> <!-- Longest Streaks Pie -->
          <Pie :title="pieChart.title" :data="pieChart.data" />
        </div>
      </div>
    </div>
  </div>
  <div class="grid">
    <div class="col-12" v-if="insidertradesData">
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
  import { formatDateToUTC, getHistogramValues } from '@/services/util';
  import { getInsiderTrades } from '@/services/insiderTrades';

  const isLoading = ref(false);
  const showError = ref(false);
  const errMsg = ref('');
  const data = ref();
  const insidertradesData = ref();
  const ticker = ref({
    symbol: 'AAPL',
    from: formatDateToUTC(new Date('2024-01-01')), 
    to: formatDateToUTC(new Date(Date.now())),
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
    title: '',
    data: [],
  })

  const dualAxisChart = ref({
    title: '',
    data: [],
  })

  const retrieveData = async () => {    
    try {
      isLoading.value = true;
      showError.value = false;
      //let query = JSON.parse(JSON.stringify(ticker.value));
      let query = { ...ticker.value }; // Shallow copy
      query.from = formatDateToUTC(new Date(query.from));
      query.to = formatDateToUTC(new Date(query.to));

      const [historicalRes, metricsRes, insiderTradesRes] = await Promise.allSettled([
        getHistoricalPrice(query.symbol, query.from, query.to, 'W'),
        getMetrics(query.symbol),
        getInsiderTrades(query.symbol, query.from, query.to)
      ]);

      var diffs = [];
      var dates = [];
      var percentages = [];
      if (historicalRes.status === 'fulfilled') {
        data.value = historicalRes.value.data;
        diffs = data.value.map(item => item.diff);
        dates = data.value.map(item => item.Date);
        percentages = data.value.map(item => item.percentage);
      } else {
        data.value = undefined;
        histChart.value = { title: '', data: [] };
        donutChart.value = { title: '', data: [] };
        lineChart.value = { title: '', data: [] };
        pieChart.value = { title: '', data: [] };
        //console.log("Failed to fetch historical prices:", histChart.value);
        //console.error("Failed to fetch historical prices:", historicalRes.reason);
      }

      if (diffs.length > 0) {
        histChart.value.title = "Price Movement Histogram";
        histChart.value.data = diffs;
        donutChart.value.title = "Sentimental Donut";
        donutChart.value.data = diffs;
        pieChart.value.title = "Longest Streaks"
        pieChart.value.data = diffs;
      }
      if (dates.length > 0 && percentages.length > 0) {
        lineChart.value.title = "Percentage Change in Price";
        lineChart.value.data = [dates.reverse(), percentages.reverse()];
        //console.log("LineChart: ", lineChart.value.data);
      }

      var earningsHistory = [];
      var earningsHistoryDates = [];
      var earningsHistorySurprise = [];
      var earningsHistoryEPSEstimate = [];
      var earningsHistoryReportedEPS = [];
      if (metricsRes.status === 'fulfilled') {
        stats.value.data = metricsRes.value.data;
        earningsHistory = metricsRes.value.data.earningsHistory || []; // 2020-01-28T21:00:00+00:00
        earningsHistory = earningsHistory.slice(0, 12); // keep only the most recent 8 entries
        earningsHistoryDates = earningsHistory.map(item => item['Earnings Date'].split('T')[0]); // only keep date part
        // todo: get the index for the date range defined by query.from and query.to, and slice the arrays accordingly
        earningsHistorySurprise = earningsHistory.map(item => item['Surprise(%)']);
        earningsHistoryEPSEstimate = earningsHistory.map(item => item['EPS Estimate']);
        earningsHistoryReportedEPS = earningsHistory.map(item => item['Reported EPS']);
        dualAxisChart.value.title = "Earnings vs. Expectations";
        dualAxisChart.value.data = [earningsHistoryDates.reverse(), earningsHistoryEPSEstimate.reverse(), earningsHistoryReportedEPS.reverse(), earningsHistorySurprise.reverse()];
        //console.log(dualAxisChart.value.data);
      } else {
        stats.value.data = [];
        //console.error("Failed to fetch metrics:", metricsRes.reason);
      }
      
      if (insiderTradesRes.status === 'fulfilled') {
        insidertradesData.value = insiderTradesRes.value.data;
      } else {
        insidertradesData.value = undefined;
        //console.error("Failed to fetch insider trades:", insiderTradesRes.reason);
      }

      if (historicalRes.status == 'rejected' || metricsRes.status == 'rejected' || insiderTradesRes.status == 'rejected') {
        showError.value = true;
        if (historicalRes.status == 'rejected' && historicalRes.reason && historicalRes.reason.response) {
          if (historicalRes.reason.response.data && historicalRes.reason.response.data.detail) {
            errMsg.value = historicalRes.reason.response.data.detail;
          } else {
            errMsg.value = "Failed to fetch historical data.";
          }
        } else if (metricsRes.status == 'rejected' && metricsRes.reason && metricsRes.reason.response) {
          if (metricsRes.reason.response.data && metricsRes.reason.response.data.detail) {
            errMsg.value = metricsRes.reason.response.data.detail;
          } else {
            errMsg.value = "Failed to fetch metrics.";
          }
        } else if (insiderTradesRes.status == 'rejected' && insiderTradesRes.reason && insiderTradesRes.reason.response) {
          showError.value = false;
          // if (insiderTradesRes.reason.response.data && insiderTradesRes.reason.response.data.detail) {
          //   errMsg.value = insiderTradesRes.reason.response.data.detail;
          // } else {
          //   errMsg.value = "Failed to fetch insider trades.";
          // }
        } else {
          errMsg.value = "An error occurred while fetching data.";
        }
      } else {
        showError.value = false;
      }

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
    } finally {
      isLoading.value = false;
    }
  }

</script>