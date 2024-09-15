const tickersHandlers = new Map();

const loadTickers = () => {
  if (tickersHandlers.size === 0) return;

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=7555ba6175be1484b36196a63647e634f9b3b6b7543e0c19c834ddea10a49f59`
  )
    .then((result) => result.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );
      console.log(updatedPrices);
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        return handlers.forEach((fn) => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, callback) => {
  // if (!tickers.has(ticker)) {
  //   tickers.set(ticker, []);
  // }

  const subscribers = tickersHandlers.has(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);
};

export const unsubscribeFromTicker = (ticker, callback) => {
  const subscribers = tickersHandlers.has(ticker) || [];
  tickersHandlers.set(
    ticker,
    subscribers.filter((fn) => fn !== callback)
  );
};

setInterval(loadTickers, 5000);
window.tickers = tickersHandlers;
