<template>
  <!-- Bar -->
  <div class="grid">
    <div class="col">
      <Toolbar class="">
        <template #start>
            <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
            <Button icon="pi pi-chart-bar" class="mr-2" label="Dashboard" disabled/>
        </template>

        <template #end>
          <Button icon="pi pi-sign-out" class="mr-2" label="Exit" @click="logOut" />
        </template>
      </Toolbar>
    </div>
  </div>

  <!-- Data Table ---->
  <div class="grid">
    <div class="col">
      <DataTable 
      v-model:filters="filters" :value="trades" @filter="recomputeBasedonFilters" 
      editMode="cell" @cell-edit-complete="onCellEditComplete" 
      paginator :rows="10" dataKey="id" filterDisplay="row" :loading="loading" :size="size.value"
      :globalFilterFields="['category', 'open_date', 'close_date', 'ticker', 'qty', 'trade_price', 'closed_price', 'remark']">
      
      <!-- table headers -->
      <template #header>
        <div> <!---class="flex justify-content-end"> Global Keyword Search -->
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
        </div>
      </template>
      <template #empty> No trades found. </template>
      <template #loading> Loading data. Please wait. </template>

      <!-- START:: table content -->
      <Column 
        v-for="col of columns" style="min-width: 8rem" sortable 
          :key="col.field" 
          :field="col.field" 
          :header="col.header" 
          :editable="col.editable"
          :showFilterMenu="col.editable ? true : false">
        <!-- data -->
        <template #body="{ data }">
          {{ typeof data[col.field] === 'number' ? data[col.field].toLocaleString('en-US', { minimumFractionDigits: 2 }) : data[col.field] }}
        </template>        
        <!-- filter -->
        <template #filter="{ filterModel, filterCallback }">
          <template v-if="col.editable">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" />
          </template>
        </template>
        <!-- edit -->
        <template #editor="{ data, field }">
          <template v-if="col.editable"> <!-- only editable columns -->
            <!-- category -->
            <template v-if="col.options"> 
              <Dropdown v-model="data[field]" :options="col.options" autofocus />
            </template>
            <!-- numbers check, qty, trade_price, option -->
            <template v-else-if="col.type === 'float'"> 
              <InputNumber v-model="data[field]" :minFractionDigits="2" autofocus />
            </template>
            <!-- date check -->
            <template v-else-if="col.type === 'datepicker'"> 
              <Calendar v-model="data[field]" :inputStyle="{'width': '100%'}" :readonlyInput="false" autofocus />
            </template>     
            <!-- remark -->     
            <template v-else>
              <InputText v-model="data[field]" autofocus />
            </template>
          </template>
          <template v-else>
            {{ data[field] }}
          </template>
        </template>
      </Column>
      <Column :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
      <!-- END:: table content -->

      <template #footer>
          <p class="m-0">
            <b>Total Cost: </b>{{ totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} <br>
            <b>Total Net Liquidity: </b>{{ totalNetLiquid.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} <br>
            <b>Total Profit/Loss: </b>{{ totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} <br>
          </p>

      </template>
      </DataTable>
    </div>
  </div>

  <!----------- Dialogs ----------->
  <!-- add new -->
  <Dialog v-model:visible="tradeDialog" :style="{width: '450px'}" header="Trade Details" :modal="true" class="p-fluid">
    <div class="field" v-for="col of columns" :key="col.field">
      <template v-if="col.editable">
        <label for ="col.field">{{ col.header }}</label>
        <template v-if="col.options">
          <Dropdown v-model="trade[col.field]" :options="col.options" required/>
        </template>
        <template v-else-if="col.type === 'datepicker'"> <!-- date check -->
          <Calendar v-model="trade[col.field]" :inputStyle="{'width': '100%'}" :readonlyInput="false" :dateFormat="'yy-mm-dd'"></Calendar>
        </template>
        <template v-else-if="col.type === 'float'"> <!-- numbers check -->
          <InputNumber v-model="trade[col.field]" :minFractionDigits="2" required/>
        </template>
        <template v-else-if="col.type === 'text'">
          <Textarea v-model="trade[col.field]" rows="3" cols="20"/>
        </template>
        <template v-else>
          <InputText v-model="trade[col.field]" required/>
        </template>
      </template>
    </div>
    <template #footer>
      <div>
        <div><InlineMessage v-if="showAddError">{{ errMsg }}</InlineMessage></div>
      <div>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Save" icon="pi pi-check" text @click="saveTrade" />
      </div>
    </div>
    </template>
  </Dialog>
  <!-- confirm delete -->
  <Dialog v-model:visible="confirmDeleteDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
    <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="trade">Are you sure you want to delete?</span>
    </div>
    <template #footer>
        <Button label="No" icon="pi pi-times" text @click="confirmDeleteDialog = false"/>
        <Button label="Yes" icon="pi pi-check" text @click="deleteTrade" />
    </template>
  </Dialog>

</template>

<script setup>
  import { ref, onMounted  } from 'vue';
  import { getPositions, addNewPosition, removePosition, updatePosition } from '@/services/api';
  import { getTicker, getOption } from '@/services/api'; 
  import { accessIndexedDB } from '@/services/indexedDb';
  import { FilterMatchMode } from 'primevue/api';
  import { formatDate } from '@/services/util';

  const accessIndexedDb = accessIndexedDB('trades-journal', [['tickers', 'ticker'], ['options', 'id']]);
  // const accessOptionIndexedDb = accessIndexedDB('trades-journal', 'options', 'id');
  const size = ref({ label: 'Small', value: 'small' });
  const showAddError = ref(false);
  const confirmDeleteDialog = ref(false);
  const tradeDialog = ref(false);
  const trades = ref();
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    category: { value: null, matchMode: FilterMatchMode.CONTAINS },
    open_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    close_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ticker: { value: null, matchMode: FilterMatchMode.CONTAINS },
    qty: { value: null, matchMode: FilterMatchMode.CONTAINS },
    option_price: { value: null, matchMode: FilterMatchMode.CONTAINS },
    trade_price: { value: null, matchMode: FilterMatchMode.CONTAINS },
    closed_price: { value: null, matchMode: FilterMatchMode.CONTAINS },
    currentPrice: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cost: { value: null, matchMode: FilterMatchMode.CONTAINS },
    netLiquid: { value: null, matchMode: FilterMatchMode.CONTAINS },
    profitLoss: { value: null, matchMode: FilterMatchMode.CONTAINS },
    remark: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const loading = ref(true);
  const columns = ref([
    { field: 'category', header: 'Type', editable: true, options: ['Long', 'Put', 'Call', 'Short']},
    { field: 'open_date', header: 'Open Date', editable: true, type: 'datepicker' },
    { field: 'close_date', header: 'Close Date', editable: true, type: 'datepicker' },
    { field: 'ticker', header: 'Ticker', editable: true },
    { field: 'qty', header: 'Quantity', editable: true, type: 'float' },
    { field: 'option_price', header: 'Option', editable: true, type: 'float' },
    { field: 'trade_price', header: 'Trade Price', editable: true, type: 'float' },
    { field: 'closed_price', header: 'Closed Price', editable: true, type: 'float' },
    { field: 'currentPrice', header: 'Current Price', editable: false },
    { field: 'cost', header: 'Cost', editable: false },
    { field: 'netLiquid', header: 'Net Liquid', editable: false },
    { field: 'profitLoss', header: 'Profit/Loss', editable: false },
    // { field: 'remark', header: 'Remark', editable: true, type: 'text' }
  ]);

  const trade = ref({});
  const filteredTrades = ref({});
  let totalCost = 0;
  let totalNetLiquid = 0;
  let totalProfitLoss = 0;
  let errMsg = "";

  onMounted(async () => {
    try {
      loading.value = true; 
      //trades.value = await fetchTrades();
      trades.value = getData(fetchFakeTrades());
      loading.value = false; 
      // test();
    } catch (error) {
      console.error(error);
      loading.value = false;
    }
  });

  const test = async () => {
    try {
      let queryOption = {}
      queryOption.ticker = "AAPL";
      queryOption.type = "Call";
      queryOption.expire_date = "2024-04-05";
      queryOption.strike_price = 177.5;
      queryOption.id = queryOption.ticker + queryOption.type + queryOption.expire_date + queryOption.strike_price;
      const existing = await accessIndexedDb.getDataIndexedDb(queryOption.id, "options");
      if (existing == undefined) {
        const response = await getOption(queryOption);
        accessIndexedDb.storeData(response.data, "options")
        console.log("response: ", response.data)
      } else {
        console.log("existing: ", existing);
      }
      
    } catch (error) {
      console.error(error);
    }
  }


  const fetchTickerData = async (tradeElement) => {
    const existing = await accessIndexedDb.getDataIndexedDb(tradeElement.ticker, "tickers");
    if (existing == undefined) {
      const response = await getTicker(tradeElement.ticker);
      accessIndexedDb.storeData(response.data, "tickers"); 
      tradeElement.currentPrice = response.data.closed_price;
    } else {
      tradeElement.currentPrice = existing.closed_price;
    }
    return tradeElement;
  };

  const fetchOptionData = async (tradeElement) => {
    tradeElement.type = tradeElement.category;
    tradeElement.expire_date = tradeElement.close_date;
    tradeElement.strike_price = tradeElement.trade_price;
    tradeElement.option_id = tradeElement.ticker + tradeElement.type + tradeElement.close_date + tradeElement.trade_price;
    const existing = await accessIndexedDb.getDataIndexedDb(tradeElement.option_id, "options");
    if (existing == undefined) {
      const response = await getOption(tradeElement);
      accessIndexedDb.storeData(response.data, "options");
      tradeElement.currentPrice = response.data.ask;
    } else {
      tradeElement.currentPrice = existing.ask;
    }
    return tradeElement;
  };

  // need to check if expiry date is past today
  const computeOptionPerformance = async(tradeElement) => {
    tradeElement.cost = parseFloat((tradeElement.qty * tradeElement.option_price).toFixed(2));
    tradeElement.netLiquid = parseFloat((tradeElement.qty * tradeElement.currentPrice).toFixed(2));
    tradeElement.profitLoss = parseFloat((tradeElement.cost - tradeElement.netLiquid).toFixed(2));
    return tradeElement;
  }

  const computeTradePerformance = async(tradeElement) => {
    tradeElement.cost = parseFloat((tradeElement.qty * tradeElement.trade_price).toFixed(2));
    tradeElement.netLiquid = parseFloat((tradeElement.qty * tradeElement.currentPrice).toFixed(2));
    tradeElement.profitLoss = parseFloat((tradeElement.netLiquid - tradeElement.cost).toFixed(2));
    return tradeElement;
  }

  const computePastTradePerformance = async(tradeEleemnt) => {
    tradeElement.netLiquid = 0
    const netLiquid = parseFloat((tradeElement.qty * tradeElement.closed_price).toFixed(2));
    tradeElement.cost = parseFloat((tradeElement.qty * tradeElement.trade_price).toFixed(2));
    tradeElement.profitLoss = parseFloat((tradeElement.cost - netLiquid).toFixed(2));
    return tradeElement;
  }

  const computePastOptionPerformance = async(tradeElement) => {
    tradeElement.netLiquid = 0
    const netLiquid = parseFloat((tradeElement.qty * tradeElement.closed_price).toFixed(2));
    tradeElement.cost = parseFloat((tradeElement.qty * tradeElement.option_price).toFixed(2));
    tradeElement.profitLoss = parseFloat((tradeElement.cost - netLiquid).toFixed(2));
    return tradeElement;
  }

  const processTradeElement = async (tradeElement) => {
    if (tradeElement.closed_price == null) { // UNREALIZED GAIN-LOSS
      if (tradeElement.category === 'Long' || tradeElement.category === 'Short') {
        tradeElement = await fetchTickerData(tradeElement);
        await computeTradePerformance(tradeElement);
      } else if (tradeElement.category === 'Call' || tradeElement.category === 'Put') {
        tradeElement = await fetchOptionData(tradeElement);
        await computeOptionPerformance(tradeElement);
      }
    } else {  // REALIZED GAIN-LOSS
      if (tradeElement.category === 'Long' || tradeElement.category === 'Short') {
        await computePastTradePerformance(tradeElement);
      } else if (tradeElement.category === 'Call' || tradeElement.category === 'Put') {
        await computePastOptionPerformance(tradeElement);
      }
    }
    totalCost += tradeElement.cost; 
    totalNetLiquid += tradeElement.netLiquid;
    totalProfitLoss += tradeElement.totalProfitLoss;
    return tradeElement;
  };

  const fetchTrades = async () => {
    try {
      const response = await getPositions();
      const tradesData = response.data;

      const fetchTickerPromises = tradesData.map(processTradeElement);
      const resolvedTrades = await Promise.all(fetchTickerPromises);

      return tradesData;
    } catch (error) {
      console.error(error);
      throw error; // Rethrow the error to be caught by the calling function
    }
  };

  const getData = (data) => {
    return [...(data || [])].map((d) => {
      return d;
    });
  };

  const fetchFakeTrades = () => {
    const tradesData = [];
    const types = ['Long', 'Short', 'Call', 'Put'];
    const tickers = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA'];
    const startDate = new Date(2023, 0, 1); // Start date for generating random dates
    const endDate = new Date(); // End date is current date

    for (let i = 0; i < 16; i++) {
      const category = types[Math.floor(Math.random() * types.length)];
      const openDate = formatDate(new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())));
      const closeDate = formatDate(new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())));
      const ticker = tickers[Math.floor(Math.random() * tickers.length)];
      const qty = Math.floor(Math.random() * 100) + 1; // Random quantity between 1 and 1000
      const trade_price = parseFloat((Math.random() * 1000).toFixed(2)); // Random trade price
      let closed_price = parseFloat((Math.random() * 1000).toFixed(2)); // Random current price
      // if (category  == 'Long' || category == 'Short') { // this should be done parallel 
      //   fetchCurrentPrice(ticker);
      // }
      const currentPrice = parseFloat((Math.random() * 1000).toFixed(2)); // Random current price
      let cost = parseFloat((qty * trade_price).toFixed(2)); // Cost calculation
      let netLiquid = parseFloat((qty * currentPrice).toFixed(2)); // Net liquid calculation
      let profitLoss = parseFloat((netLiquid - cost).toFixed(2)); // Profit/Loss calculation
      let option_price = null;
      if (category === 'Put' || category === 'Call') {
        option_price = parseFloat((Math.random() * 100).toFixed(2));
        cost = option_price;
        netLiquid = option_price;
        profitLoss = option_price
        closed_price = null;
      }

      const remark = Math.random() < 0.5 ? 'Profit' : 'Loss'; // Random remark

      tradesData.push({
        id: i + 1,
        category: category,
        open_date: openDate,
        close_date: closeDate,
        ticker: ticker,
        qty: qty,
        option_price: option_price,
        trade_price: trade_price,
        closed_price: closed_price,
        currentPrice: currentPrice,
        cost: cost,
        netLiquid: netLiquid,
        profitLoss: profitLoss,
        remark: remark
      });
    }

    // console.log(tradesData);
    return tradesData;
  };

  const confirmDelete = (ele) => {
      trade.value = ele;
      console.log("Delete::::", trade);
      confirmDeleteDialog.value = true;

  };

  const deleteTrade = () => {
    console.log(trade.value.id)
    removePosition(trade.value.id)
      .then(response => {
        console.log(response);
        console.log("deleted")
        trades.value = trades.value.filter(val => val.id != trade.value.id);
        trade.value = {};
        confirmDeleteDialog.value = false;
      })
      .catch(error => {
        console.error(error);
      })
    
    
  }

  const openNew = () => {
    trade.value = {};
    trade.value.category = 'Long';
    trade.value.open_date = new Date();
    tradeDialog.value = true;
    showAddError.value = false;
    errMsg = "";
  }

  const hideDialog = () => {
    tradeDialog.value = false;
    // submitted.value = false;
  };

  const saveTrade = async () => {
    showAddError.value = false;
    errMsg = "";
    let addTradeObject = JSON.parse(JSON.stringify(trade.value));

    // Format date fields if necessary
    if (addTradeObject.close_date !== undefined) {
      addTradeObject.close_date = formatDate(addTradeObject.close_date);
    }
    addTradeObject.open_date = formatDate(addTradeObject.open_date);
    // console.log("Newww: ", addTradeObject);
    //trades.value.push(addTrade);

    try {
      const response = await addNewPosition(addTradeObject);
      addTradeObject = await processTradeElement(addTradeObject);
      trades.value.push(addTradeObject);
      tradeDialog.value = false;

    } catch (error) {
      console.error(error)
      errMsg = error.response.data.detail;
      console.error(errMsg);
      showAddError.value = true;
    }   
  }

  const onCellEditComplete = (event) => {
      let { data, newValue, field } = event;
      if (data[field] != newValue) { // only if it's a new value 
        if (field == 'open_date' || field == 'close_date') {
          data[field] = formatDate(newValue);
        } else {
          // recompute cost, net liquid and profit/loss for qty and trade price change
          data[field] = newValue;
        }
        const updateTradeObject = JSON.parse(JSON.stringify(data));
        if (updateTradeObject.closed_price == "") {
          updateTradeObject.closed_price = null;
        }
        updatePosition(updateTradeObject.id, updateTradeObject) 
          .then(response => {
            console.log("OK: ", response.data);
          })
          .catch(error => {
            console.error(error);
          })
      }
      // need to call backend API to update 
  };

  const recomputeBasedonFilters = (filterEvent) => {
    // Retrieve filtered data from filterEvent and update totals
    console.log("Recomputing");
    filteredTrades.value = filterEvent.filteredValue;
    totalCost = 0;
    totalNetLiquid = 0;
    totalProfitLoss = 0;
    for (const e of filteredTrades.value) {
        totalCost += e.cost;
        totalNetLiquid += e.netLiquid;
        totalProfitLoss += e.profitLoss;
    }
    console.log("totalNetLiquid: ", totalNetLiquid)

  };


  import { useRouter } from 'vue-router';
  const router = useRouter();
  
  const logOut = () => {
    sessionStorage.removeItem("token");
    router.push('/');
  }

</script>

<style>
  .p-column-filter-row .p-column-filter-menu-button, .p-column-filter-row .p-column-filter-clear-button {
    margin-left: 0rem; 
  }
</style>
