const API_KEY = '7555ba6175be1484b36196a63647e634f9b3b6b7543e0c19c834ddea10a49f59';

const tickersHandlers = new Map();

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const AGGREGATE_INDEX = '5';

socket.addEventListener('message', (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

// const loadTickers = () => {
//   if (tickersHandlers.size === 0) return;

//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`
//   )
//     .then((result) => result.json())
//     .then((rawData) => {
//       const updatedPrices = Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.USD])
//       );
//       console.log(updatedPrices);
//       Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandlers.get(currency) ?? [];
//         return handlers.forEach((fn) => fn(newPrice));
//       });
//     });
// };

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWS(ticker) {
  const message = { action: 'SubAdd', subs: [`5~CCCAGG~${ticker}~USD`] };
  sendToWebSocket(message);
}

function unsubscribeFromTickerOnWS(ticker) {
  const message = { action: 'SubRemove', subs: [`5~CCCAGG~${ticker}~USD`] };
  sendToWebSocket(message);
}

export const subscribeToTicker = (ticker, callback) => {
  // if (!tickers.has(ticker)) {
  //   tickers.set(ticker, []);
  // }

  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);
  subscribeToTickerOnWS(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWS(ticker);
};

// setInterval(loadTickers, 5000);
window.tickers = tickersHandlers;
