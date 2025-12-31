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
        <InlineMessage v-if="ui.showError" severity="error">{{ui.errMsg}}</InlineMessage>
      </div>

    </div>
  </div>
  <!-- Returns -->
  <div class="grid nested-grid">
    <!-- Spinner -->
    <div class="col-12 text-center" v-if="ui.isLoading">
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
          <Histogram :title="charts.histChart.title" :data="charts.histChart.data" />
        </div>
        <div class="col-6" > <!-- Sentimental Donut -->
          <Donut :title="charts.donutChart.title" :data="charts.donutChart.data" />
        </div>
        <div class="col-12" > <!-- Percentage Change in Price -->
          <LineChart :title="charts.lineChart.title" :data="charts.lineChart.data" />
        </div>
        <div class="col-6"> <!-- Earnings vs. Expectations Dual Axis -->
          <DualAxis :title="charts.dualAxisChart.title" :data="charts.dualAxisChart.data" />
        </div>
        <div class="col-6"> <!-- Longest Streaks Pie -->
          <Pie :title="charts.pieChart.title" :data="charts.pieChart.data" />
        </div>
      </div>
    </div>
  </div>
  <!-- Insider -->
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
  import { ref, reactive } from 'vue';
  import { getHistoricalPrice, getMetrics } from '@/services/api';
  import { getInsiderTrades } from '@/services/insiderTrades';
  import { stock_columns, insider_trades_columns } from '@/components/Columns.js';
  import { formatDateToUTC, getHistogramValues } from '@/services/util';

  // declare variables
  const ui = reactive({
    isloading: false,
    showError: false,
    errMsg: '',
  });

  const data = ref();
  const insidertradesData = ref();
  const ticker = reactive({
    symbol: 'AAPL',
    from: formatDateToUTC(new Date('2025-01-01')), 
    to: formatDateToUTC(new Date(Date.now())),
    frequency: 'Weekly'
  })

  const stats = ref({
    title: '',
    data: [],
  });

  const charts = reactive({
    histChart: { title: '', data: []},
    donutChart: { title: '', data: []},
    lineChart: { title: '', data: []},
    pieChart: { title: '', data: []},
    dualAxisChart: { title: '', data: []},
  });

  const retrieveData = async () => {    
    try {
      ui.isLoading = true;
      ui.showError = false;
      let query = { ...ticker }; // Shallow copy
    
      query.from = formatDateToUTC(new Date(ticker.from));
      query.to = formatDateToUTC(new Date(ticker.to));

      // Fetch data concurrently from different services
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
        charts.histChart = { title: '', data: [] };
        charts.donutChart = { title: '', data: [] };
        charts.lineChart = { title: '', data: [] };
        charts.pieChart = { title: '', data: [] };
        //console.log("Failed to fetch historical prices:", histChart.value);
        //console.error("Failed to fetch historical prices:", historicalRes.reason);
      }

      // build charts
      if (diffs.length > 0) {
        charts.histChart.title = "Price Movement Histogram";
        charts.histChart.data = diffs;
        charts.donutChart.title = "Sentimental Donut";
        charts.donutChart.data = diffs;
        charts.pieChart.title = "Longest Streaks"
        charts.pieChart.data = diffs;
      }
      if (dates.length > 0 && percentages.length > 0) {
        charts.lineChart.title = "Percentage Change in Price";
        charts.lineChart.data = [dates.reverse(), percentages.reverse()];
        //console.log("LineChart: ", lineChart.value.data);
      }

      // build metrics and dual axis chart for earnings
      var earningsHistory = [];
      var earningsHistoryDates = [];
      var earningsHistorySurprise = [];
      var earningsHistoryEPSEstimate = [];
      var earningsHistoryReportedEPS = [];
      if (metricsRes.status === 'fulfilled') {
        stats.value.data = metricsRes.value.data;
        earningsHistory = metricsRes.value.data.earningsHistory || []; // 2020-01-28T21:00:00+00:00
        earningsHistory = earningsHistory.slice(0, 12); // keep only the most recent 12 entries
        earningsHistoryDates = earningsHistory.map(item => item['Earnings Date'].split('T')[0]); // only keep date part
        // todo: get the index for the date range defined by query.from and query.to, and slice the arrays accordingly
        earningsHistorySurprise = earningsHistory.map(item => item['Surprise(%)']);
        earningsHistoryEPSEstimate = earningsHistory.map(item => item['EPS Estimate']);
        earningsHistoryReportedEPS = earningsHistory.map(item => item['Reported EPS']);
        charts.dualAxisChart.title = "Earnings vs. Expectations";
        charts.dualAxisChart.data = [earningsHistoryDates.reverse(), earningsHistoryEPSEstimate.reverse(), earningsHistoryReportedEPS.reverse(), earningsHistorySurprise.reverse()];
        //console.log(dualAxisChart.value.data);
      } else {
        stats.value.data = [];
        //console.error("Failed to fetch metrics:", metricsRes.reason);
      }
      
      if (insiderTradesRes.status === 'fulfilled') {
        insidertradesData.value = insiderTradesRes.value.data;
      } else {
        insidertradesData.value = undefined;
        console.error("Failed to fetch insider trades:", insiderTradesRes.reason);
      }

      // if any of the requests failed, show an error message
      if (historicalRes.status == 'rejected' || metricsRes.status == 'rejected' || insiderTradesRes.status == 'rejected') {
        ui.showError = true;
        if (historicalRes.status == 'rejected' && historicalRes.reason && historicalRes.reason.response) {
          if (historicalRes.reason.response.data && historicalRes.reason.response.data.detail) {
            ui.errMsg = historicalRes.reason.response.data.detail;
          } else {
            ui.errMsg = "Failed to fetch historical data.";
          }
        } else if (metricsRes.status == 'rejected' && metricsRes.reason && metricsRes.reason.response) {
          if (metricsRes.reason.response.data && metricsRes.reason.response.data.detail) {
            ui.errMsg = metricsRes.reason.response.data.detail;
          } else {
            ui.errMsg = "Failed to fetch metrics.";
          }
        } else if (insiderTradesRes.status == 'rejected' && insiderTradesRes.reason && insiderTradesRes.reason.response) {
          ui.showError = false;
          if (insiderTradesRes.reason.response.data && insiderTradesRes.reason.response.data.detail) {
            ui.errMsg = insiderTradesRes.reason.response.data.detail;
          } else {
            ui.errMsg = "Failed to fetch insider trades.";
          }
        } else {
          ui.errMsg = "An error occurred while fetching data.";
        }
      } else {
        ui.showError = false;
      }

    } catch (error) {
      // console.log("Error: ", error);
      ui.showError = true;
      if (error.response != undefined && 
        error.response.data != undefined && 
        error.response.data.detail != undefined) {
          ui.errMsg = error.response.data.detail;
      }
      
    } finally {
      ui.isLoading = false;
    }
  }

</script>