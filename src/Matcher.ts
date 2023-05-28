export type Author = {
  name: string;
  id: string;
};

export type Offer = {
  author: Author;
  id: string;
  amount: number;
};

export type AllOffers = {
  bids: Offer[];
  asks: Offer[];
};

export type MatchedAmount = {
  amount: number; // amount matched from the offer
  offerId: Offer["id"]; // id of the offer to trace it back
};

export type BidExecutionBook = {
  [key: Author["name"]]: MatchedAmount[];
};

export type AskExecutionBook = {
  [key: Author["name"]]: MatchedAmount[];
};

export type ExecutionBooks = {
  bidExecutionBook: BidExecutionBook;
  askExecutionBook: AskExecutionBook;
};

export class Matcher {
  bids: Offer[];
  asks: Offer[];

  constructor() {
    this.bids = [];
    this.asks = [];
  }

  fillMockOffers() {
    const consumer1: Author = { name: "Consumer1", id: "1" };
    const consumer2: Author = { name: "Consumer2", id: "2" };
    const consumer3: Author = { name: "Consumer3", id: "3" };

    const prosumer1: Author = { name: "Prosumer1", id: "4" };
    const prosumer2: Author = { name: "Prosumer2", id: "5" };
    const prosumer3: Author = { name: "Prosumer3", id: "6" };

    this.bids = [];
    this.asks = [];

    this.bids.push({
      author: prosumer1,
      id: "1",
      amount: Math.floor(Math.random() * 20) * 5 + 5,
    });
    this.bids.push({
      author: prosumer2,
      id: "2",
      amount: Math.floor(Math.random() * 20) * 5 + 5,
    });
    this.bids.push({
      author: prosumer3,
      id: "3",
      amount: Math.floor(Math.random() * 20) * 5 + 5,
    });

    this.asks.push({
      author: consumer1,
      id: "4",
      amount: Math.floor(Math.random() * 20) * 5 + 5,
    });
    this.asks.push({
      author: consumer3,
      id: "5",
      amount: Math.floor(Math.random() * 20) * 5 + 5,
    });
    this.asks.push({
      author: consumer2,
      id: "6",
      amount: Math.floor(Math.random() * 20) * 5 + 5,
    });
  }

  addBid(offer: Offer) {
    this.bids.push(offer);
  }

  addAsk(offer: Offer) {
    this.asks.push(offer);
  }

  getOffers(): AllOffers {
    return { bids: this.bids, asks: this.asks };
  }

  match(): ExecutionBooks {
    const bidExecutionBook: BidExecutionBook = {};
    const askExecutionBook: AskExecutionBook = {};

    // Calculate total amounts for bids and asks
    const totalBidAmount = this.bids.reduce(
      (total, bid) => total + bid.amount,
      0
    );
    const totalAskAmount = this.asks.reduce(
      (total, ask) => total + ask.amount,
      0
    );

    // If there are no bids or asks, return empty execution books
    if (totalBidAmount === 0 || totalAskAmount === 0) {
      return { bidExecutionBook, askExecutionBook };
    }

    if (totalBidAmount > totalAskAmount) {
      // move all asks to the execution book
      this.asks.forEach((ask) => {
        if (!askExecutionBook[ask.author.name]) {
          askExecutionBook[ask.author.name] = [];
        }
        askExecutionBook[ask.author.name].push({
          amount: ask.amount,
          offerId: ask.id,
        });
      });

      // Proportionally match bids and move bids to the execution book
      const askToBidRatio = totalAskAmount / totalBidAmount;
      this.bids.forEach((bid) => {
        if (!bidExecutionBook[bid.author.name]) {
          bidExecutionBook[bid.author.name] = [];
        }
        bidExecutionBook[bid.author.name].push({
          amount: bid.amount * askToBidRatio,
          offerId: bid.id,
        });
      });
    } else if (totalBidAmount < totalAskAmount) {
      // move all bids to the execution book
      this.bids.forEach((bid) => {
        if (!bidExecutionBook[bid.author.name]) {
          bidExecutionBook[bid.author.name] = [];
        }
        bidExecutionBook[bid.author.name].push({
          amount: bid.amount,
          offerId: bid.id,
        });
      });

      // Proportionally match asks and move asks to the execution book
      const bidToAskRatio = totalBidAmount / totalAskAmount;
      this.asks.forEach((ask) => {
        if (!askExecutionBook[ask.author.name]) {
          askExecutionBook[ask.author.name] = [];
        }
        askExecutionBook[ask.author.name].push({
          amount: ask.amount * bidToAskRatio,
          offerId: ask.id,
        });
      });
    } else {
      // move all bids and asks to the execution book
      this.bids.forEach((bid) => {
        if (!bidExecutionBook[bid.author.name]) {
          bidExecutionBook[bid.author.name] = [];
        }
        bidExecutionBook[bid.author.name].push({
          amount: bid.amount,
          offerId: bid.id,
        });
      });

      this.asks.forEach((ask) => {
        if (!askExecutionBook[ask.author.name]) {
          askExecutionBook[ask.author.name] = [];
        }
        askExecutionBook[ask.author.name].push({
          amount: ask.amount,
          offerId: ask.id,
        });
      });
    }

    return { bidExecutionBook, askExecutionBook };
  }
}
