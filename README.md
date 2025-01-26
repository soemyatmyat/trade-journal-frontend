## Description 
Trade journal for recording trading activites. It has never been easy to track your trading activites. 

## Iteration 0
- [X] Authentication calls (user and token) and setup Authorization
- [X] Generate Fake data for testing
- [X] Restful CRUD calls (positions, tickers)
- [X] Compute trades metrics on the fly 
- [X] Indexing data (for instance, tickers info) to minimize API calls to backend 
  
## Iteration 0.1
- [X] Login Form UI + Error Handlings + Guest Pass
- [X] Home Page UI to display trading positions 
- [X] Dialog to add a new trading position 
- [X] Edit, Delete existing positions UI
- [X] Logout mechanism 
- [X] Include .env 

## Iteration 0.2
- [ ] Revisit indexed Data for updates (for options: check expiry date before calling backend APIs)
- [ ] Show, hide closed/past positions
- [ ] Portfolio Dashboard (position analysis: understand your holdings)
- [ ] Historical Stock Price Dashboard (stock analysis: observe price volatility and identify the price patterns for your next move!)
  - [X] Historical Price table 
    - [ ] Export to CSV  
  - [X] Price Movement Histogram 
  - [X] Line Chart
  - [X] Sentimental Donut 
  - [X] Added Stock Metrics
  - [X] Usability: detect enter key for the dashboard
- [X] Date confusion: https://www.fullstackfoundations.com/blog/javascript-dates
  - [X] Javascript new date must be converted to UTC as it functions differently depending on whether new date is generated from the server or from the browser. 

## Iteration 0.3 
- [X] Add a new chart to record max streaks for positive, negative and neutral metrics. Price movement is considered to be in neutral range if it is within one bandwidth. 
- [ ] Revisit the codes and look for component abstraction implementation (vue specific)

## Credits 
- Ready-made Components: [PrimeVue](https://primevue.org/)
- CSS Utility: [PrimeFlex](https://primeflex.org)
- UI Icons: [primeicons](https://www.npmjs.com/package/primeicons)
- Logo: <a href="https://www.flaticon.com/free-icons/stock-market" title="stock market icons">Stock market icons created by Paul J. - Flaticon</a>
- Visualization Brainstrom: [Nuts and Bolts of Chart Types](https://cdn-infographic.pressidium.com/wp-content/uploads/Graph-and-Chart-Types-Infographic.jpg)

## References
- [JavaScript Dates](https://www.fullstackfoundations.com/blog/javascript-dates)


