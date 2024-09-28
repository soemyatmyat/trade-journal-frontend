export const formatDate = (value) => {
  const date = new Date(value);
  console.log("date: ", date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Build a range centered on median, std is step. 
export const builtRange = (start, end, mid, step = 1) => {
  const result = [];
  const midPoint = mid - step/2;
  for (let i = midPoint; i < end + step/2; i += step) {
    result.push(i);
  }
  for (let i = midPoint-step; i > start - step/2; i -= step) {
      result.push(i);
  }
  return result.sort((a, b) => a - b);;
}

export const fetchFakeTrades = () => {
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

// given an array as an input, this function returns bin midpoint, frequency and bin width 
export const getHistogramValues = (arr) => {
  const sortedArr= arr.sort((a, b) => a - b); // sort first 
  const len = sortedArr.length;
  // get stats 
  const minValue = sortedArr[0];
  const maxValue = sortedArr[len-1];
  const middleIndex = Math.floor(len / 2);
  let median;
  if (len % 2 === 0) {
    median = (sortedArr[middleIndex - 1] + sortedArr[middleIndex]) / 2;
  } else {
    median = sortedArr[middleIndex];
  }
  const meanValue = arr.reduce((acc, val) => acc + val, 0) / len;
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - meanValue, 2), 0) / len;
  const binWidth = Math.ceil(Math.sqrt(variance));
  const binEdges = builtRange(Math.floor(minValue), Math.ceil(maxValue), Math.floor(median), binWidth);
  const frequency = Array(binEdges.length).fill(0);
  for (const ele of sortedArr) {
    for (let i = 0; i < binEdges.length; i++) {
      if (ele > (binEdges[i] - binWidth/2) && ele < (binEdges[i] + binWidth/2)) {
          frequency[i]++;
          break; // Exit the inner loop once the bin is found
      }
    }
  }
  return { binEdges, frequency, binWidth };
}
