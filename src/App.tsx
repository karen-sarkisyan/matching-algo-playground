import { useCallback, useMemo } from "react";

import "./App.css";
import { OfferBlock } from "./components/offerBlock";
import { useMatcher } from "./hooks/useMatcher";
import type {
  BidExecutionBook,
  AskExecutionBook,
  ExecutionBooks,
  Author,
} from "./Matcher";

type MatchedAmountPerUser = {
  [key: Author["name"]]: number;
};

type MatchResultsToDisplay = {
  matchedProsumers: MatchedAmountPerUser | null;
  matchedConsumers: MatchedAmountPerUser | null;
};

function App() {
  const { fillOffers, matchOffers, executionBooks, offers } = useMatcher();

  const { matchedProsumers, matchedConsumers } =
    useMemo<MatchResultsToDisplay>(() => {
      if (executionBooks) {
        const matchedProsumers: MatchedAmountPerUser = {};
        const matchedConsumers: MatchedAmountPerUser = {};
        Object.keys(executionBooks.askExecutionBook).forEach((consumerId) => {
          const consumerAmounts =
            executionBooks.askExecutionBook[
              consumerId as keyof AskExecutionBook
            ];
          matchedConsumers[consumerId] = consumerAmounts.reduce((acc, curr) => {
            return acc + curr.amount;
          }, 0);
        });

        Object.keys(executionBooks.bidExecutionBook).forEach((prosumerId) => {
          const prosumerAmounts =
            executionBooks.bidExecutionBook[
              prosumerId as keyof BidExecutionBook
            ];
          matchedProsumers[prosumerId] = prosumerAmounts.reduce((acc, curr) => {
            return acc + curr.amount;
          }, 0);
        });
        return {
          matchedProsumers,
          matchedConsumers,
        };
      }
      return {
        matchedProsumers: null,
        matchedConsumers: null,
      };
    }, [executionBooks]);

  let totalBidAmount = 0;
  let totalAskAmount = 0;

  let totalMatchedBidAmount = 0;
  let totalMatchedAskAmount = 0;

  return (
    <div className="App">
      <div className="controls">
        <button onClick={fillOffers}>Fill Offers</button>
        <button onClick={matchOffers}>Match Offers</button>
        <button onClick={demoResolve}>Demo resolve</button>
      </div>
      <div className="content">
        <div className="book">
          <h2 className="book__header">{`Order Book${
            executionBooks ? " (matched)" : ""
          }`}</h2>
          <div className="book__content">
            <div className="book__column">
              {offers.bids.length > 0 &&
                offers.bids.map((offer) => {
                  totalBidAmount += offer.amount;
                  return (
                    <OfferBlock
                      key={offer.id}
                      name={offer.author.name}
                      amount={offer.amount}
                      matchedAmount={matchedProsumers?.[offer.author.name]}
                      type="bid"
                    />
                  );
                })}
              <div className="book__total">
                <div className="book__total__label">Total</div>
                <div className="book__total__amount">{totalBidAmount}</div>
              </div>
            </div>
            <div className="book__column">
              {offers.asks.length > 0 &&
                offers.asks.map((offer) => {
                  totalAskAmount += offer.amount;
                  return (
                    <OfferBlock
                      key={offer.id}
                      name={offer.author.name}
                      amount={offer.amount}
                      matchedAmount={matchedConsumers?.[offer.author.name]}
                      type="ask"
                    />
                  );
                })}
              <div className="book__total">
                <div className="book__total__label">Total</div>
                <div className="book__total__amount">{totalAskAmount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* execution book */}
        <div className="book">
          <h2 className="book__header">Execution Book</h2>
          <div className="book__content">
            <div className="book__column">
              {matchedProsumers &&
                Object.keys(matchedProsumers).map((prosumerId) => {
                  totalMatchedBidAmount += matchedProsumers[prosumerId];
                  return (
                    <OfferBlock
                      key={prosumerId}
                      name={prosumerId}
                      amount={matchedProsumers[prosumerId]}
                      type="bid"
                    />
                  );
                })}
              <div className="book__total">
                <div className="book__total__label">Total</div>
                <div className="book__total__amount">
                  {totalMatchedBidAmount}
                </div>
              </div>
            </div>
            <div className="book__column">
              {matchedConsumers &&
                Object.keys(matchedConsumers).map((consumerId) => {
                  totalMatchedAskAmount += matchedConsumers[consumerId];
                  return (
                    <OfferBlock
                      key={consumerId}
                      name={consumerId}
                      amount={matchedConsumers[consumerId]}
                      type="ask"
                    />
                  );
                })}
              <div className="book__total">
                <div className="book__total__label">Total</div>
                <div className="book__total__amount">
                  {totalMatchedAskAmount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

interface Offer {
  id: string;
  amount: number;
  price: number;
}

interface ExecutionBook {
  [id: string]: Offer[];
}

function resolveOrderBook(
  bids: Offer[],
  asks: Offer[]
): [ExecutionBook, ExecutionBook] {
  const executionBids: ExecutionBook = {};
  const executionAsks: ExecutionBook = {};

  // Sort bids and asks in descending order of price
  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => b.price - a.price);

  let bidIndex = 0;
  let askIndex = 0;

  while (bidIndex < bids.length && askIndex < asks.length) {
    const bid = bids[bidIndex];
    const ask = asks[askIndex];

    // Check if bid price is equal to or higher than ask price
    if (bid.price >= ask.price) {
      const matchedAmount = Math.min(bid.amount, ask.amount);

      // Update bid offer
      bid.amount -= matchedAmount;

      // Update ask offer
      ask.amount -= matchedAmount;

      // Add matched offers to execution books
      if (!executionBids[bid.id]) {
        executionBids[bid.id] = [];
      }
      executionBids[bid.id].push({
        id: ask.id,
        amount: matchedAmount,
        price: ask.price,
      });

      if (!executionAsks[ask.id]) {
        executionAsks[ask.id] = [];
      }
      executionAsks[ask.id].push({
        id: bid.id,
        amount: matchedAmount,
        price: ask.price,
      });

      // Remove fully matched offers
      if (bid.amount === 0) {
        bidIndex++;
      }
      if (ask.amount === 0) {
        askIndex++;
      }
    } else {
      askIndex++;
    }
  }

  return [executionBids, executionAsks];
}

// Example usage
const bids: Offer[] = [
  { id: "bid1", amount: 100, price: 150 },
  { id: "bid2", amount: 5, price: 45 },
  { id: "bid3", amount: 8, price: 55 },
];

const asks: Offer[] = [
  { id: "ask1", amount: 7, price: 50 },
  { id: "ask2", amount: 4, price: 55 },
  { id: "ask3", amount: 6, price: 40 },
];

function demoResolve() {
  const [executionBids, executionAsks] = resolveOrderBook(bids, asks);
  console.log("Execution Bids:", executionBids);
  console.log("Execution Asks:", executionAsks);
}
