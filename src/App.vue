<template>
  <div>
    <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
      <div class="container">
        <section>
          <add-ticker-field
            v-model="ticker"
            :isAddBtn="isAddBtn"
            :addTicker="addTicker"
            :isExist="isExist"
            :suggest="suggest"
            @suggestion-submit="onSuggestionSubmit"
          />
          <tickers-filter
            v-model="filtered"
            :filteredList="filteredList"
            :page="Number(page)"
            @on-next-page="onNextPage"
            @on-previous-page="onPreviousPage"
          />
        </section>

        <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />
        <ticker-card
          :filteredList="filteredList"
          :formatPrice="formatPrice"
          @select-ticker="selectTicker"
          :selected="selected"
          @removeTicker="remove"
        />
        <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />
        <graph-field v-if="isCloseGraph" @close-graph="closeGraph">{{ selected.name }}</graph-field>
      </div>
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeFromTicker } from './loadTickers';
import GraphField from './components/GraphField.vue';
import AddTickerField from './components/AddTickerField.vue';
import TickersFilter from './components/TickersFilter.vue';
import TickerCard from './components/TickerCard.vue';

export default {
  components: {
    GraphField,
    AddTickerField,
    TickersFilter,
    TickerCard
  },
  data() {
    return {
      ticker: '',
      active: true,
      tickers: [],
      filtered: '',
      selected: null,
      coins: [],
      page: 1
    };
  },
  methods: {
    // recievedTicker(ticker) {
    //   this.ticker = ticker;
    // },
    updateTickers(tickerName, price) {
      this.tickers.filter((t) => t.name === tickerName).forEach((t) => (t.price = price));
    },
    formatPrice(price) {
      if (!Number.isFinite(price)) {
        return '-';
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    onSuggestionSubmit(s) {
      this.ticker = s;
    },
    // async subscribeToLoadTickers() {
    // if (!this.tickers.length) return;
    // const tickersData = await loadTickers(this.tickers.map((t) => t.name));
    // this.tickers.forEach((t) => {
    //   const price = tickersData[t.name.toUpperCase()];
    //   console.log(price);
    //   // const normilizedPrice = 1 / price
    //   // console.log(normilizedPrice)
    //   t.price = price;
    // });
    // console.log(tickersData);
    // this.tickers.find((t) => t.name === TickerName).price = tickersData.USD
    // newTicker.price = data[0]
    // }, 5000)
    // },
    remove(t) {
      this.tickers = this.tickers.filter((item) => item !== t);

      if (this.selected === t) {
        this.selected = null;
      }

      unsubscribeFromTicker(t.name);

      // const oldStorage = JSON.parse(localStorage.getItem('cryptonomicon'))
      // const filteredStorage = oldStorage.filter((item) => item.name !== t)

      // localStorage.setItem('cryptonomicon', JSON.stringify(filteredStorage))
    },
    selectTicker(ticker) {
      this.selected = ticker;
    },
    addTicker() {
      const newTicker = {
        name: this.ticker.toUpperCase(),
        price: '-'
      };
      this.tickers = [...this.tickers, newTicker];

      // this.updateTickers(newTicker.name)

      subscribeToTicker(newTicker.name, (newPrice) => this.updateTickers(newTicker.name, newPrice));
      this.ticker = '';
      this.filtered = '';
    },
    closeGraph(close) {
      this.selected = close;
    },
    async loadCoins() {
      const req = await fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true');
      const { Data } = await req.json();

      this.coins.push(Object.keys(Data));
    },
    onNextPage() {
      this.page += 1;
    },
    onPreviousPage() {
      this.page--;
    }
  },
  computed: {
    isExist() {
      return this.tickers.find(
        (t) =>
          this.ticker.toLowerCase() === t.name.toLowerCase() && this.ticker.toLowerCase() !== ''
      );
    },
    isCloseGraph() {
      if (this.tickers.length === 0) {
        return (this.selected = null);
      } else {
        return this.selected;
      }
    },
    isAddBtn() {
      return this.tickers.find((t) => t.name === this.ticker);
    },
    suggest() {
      return this.coins[0]
        ?.filter((coin) => coin.toLowerCase().includes(this.ticker.toLowerCase()))
        .slice(0, 4);
    },
    filterListFromStart() {
      return (this.page - 1) * 6;
    },
    filterListToEnd() {
      return this.page * 6;
    },
    filteredList() {
      if (this.filtered === '') {
        return this.tickers.slice(this.filterListFromStart, this.filterListToEnd);
      }

      return this.tickers
        .filter((t) => t.name.toLowerCase().includes(this.filtered.toLowerCase()))
        .slice(this.filterListFromStart, this.filterListToEnd);
    },
    pageURLState() {
      return {
        filtered: this.filtered,
        page: this.page
      };
    }
  },
  created() {
    this.loadCoins();
    console.log(this.filteredList);
    // запис шляхів в url після оновлення сторінки
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());

    const VALID_KEYS = ['filtered', 'page'];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    // if (windowData.filtered) {
    //   this.filtered = windowData.filtered
    // }

    // if (windowData.page) {
    //   this.page = windowData.page
    // }

    const tickersData = localStorage.getItem('cryptonomicon');
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((t) => {
        subscribeToTicker(t.name, (newPrice) => this.updateTickers(t.name, newPrice));
      });
    }

    // setInterval(this.subscribeToLoadTickers, 5000);
  },
  watch: {
    tickers() {
      localStorage.setItem('cryptonomicon', JSON.stringify(this.tickers));
      console.log(this.tickers);
    },
    filteredList() {
      if (this.filteredList.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    filtered() {
      this.page = 1;
    },
    pageURLState(value) {
      // const {protocol, host, pathname} = window.location
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filtered=${value.filtered}&page=${value.page}`
      );
    }
  },
  updated() {}
};
</script>

<style src="@/app.css" />
