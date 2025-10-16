export const columns = [
  { field: 'category', header: 'Type', editable: true, filterable: true, options: ['Long', 'Put', 'Call', 'Short']},
  { field: 'open_date', header: 'Open Date', editable: true, filterable: true, type: 'datepicker' },
  { field: 'close_date', header: 'Close Date', editable: true, filterable: true, type: 'datepicker' },
  { field: 'ticker', header: 'Ticker', editable: false, filterable: true}, 
  { field: 'qty', header: 'Quantity', editable: true, filterable: true, type: 'float' },
  { field: 'option_price', header: 'Option', editable: true, filterable: true, type: 'float' },
  { field: 'trade_price', header: 'Trade Price', editable: true, filterable: true, type: 'float' },
  { field: 'closed_price', header: 'Closed Price', editable: true, filterable: true, type: 'float' },
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

export const insider_trades_columns = [
  { field: 'filing_date', header: 'Filing Date' },
  { field: 'trade_date', header: 'Trade Date' },
  { field: 'ticker', header: 'Ticker' },
  { field: 'company_name', header: 'Company Name' },
  { field: 'insider_name', header: 'Insider Name' },
  { field: 'insider_title', header: 'Insider Title' },
  { field: 'trade_type', header: 'Trade Type' },
  { field: 'price', header: 'Price' },
  { field: 'qty', header: 'Qty' },
  { field: 'owned', header: 'Owned' },
  { field: 'delta_owned', header: 'Delta Owned' },
  { field: 'value', header: 'Value' }
]
