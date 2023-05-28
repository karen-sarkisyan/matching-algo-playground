import { useEffect, useState, useCallback } from "react";
import {
  AskExecutionBook,
  BidExecutionBook,
  Matcher,
  AllOffers,
  ExecutionBooks,
} from "../Matcher";

export interface UseMatcher {
  matcher: Matcher;
  offers: AllOffers;
  executionBooks: ExecutionBooks | null;
  fillOffers: () => void;
  matchOffers: () => void;
}

const matcher = new Matcher();

export const useMatcher = (): UseMatcher => {
  const [offers, setOffers] = useState<AllOffers>({ bids: [], asks: [] });
  const [executionBooks, setExecutionBooks] = useState<ExecutionBooks | null>(
    null
  );

  const fillOffers = useCallback(() => {
    const offers = matcher.fillMockOffers();
    setOffers(matcher.getOffers());
    setExecutionBooks(null);
  }, []);

  const matchOffers = useCallback(() => {
    const books = matcher.match();
    setExecutionBooks(books);
  }, []);

  useEffect(() => {
    setOffers(matcher.getOffers());
  }, []);

  return {
    matcher,
    offers,
    executionBooks: executionBooks,
    fillOffers,
    matchOffers,
  };
};
