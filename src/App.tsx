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
