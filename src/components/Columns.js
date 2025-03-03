export const columns = [
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
];

export const stock_columns = [
  { field: 'Date', header: 'Date' },
  { field: 'close', header: 'Adj Close' },
  { field: 'prev', header: 'Previous' },
  { field: 'diff', header: 'Difference' },
  { field: 'percentage', header: 'Percentage Change' }
]

