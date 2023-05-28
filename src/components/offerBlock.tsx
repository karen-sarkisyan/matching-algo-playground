interface OfferProps {
  name: string;
  amount: number;
  matchedAmount?: number;
  type: "bid" | "ask";
}

export function OfferBlock({ name, amount, matchedAmount, type }: OfferProps) {
  const textClass = `offer__text ${amount < 20 ? "offer__text--small" : ""}`;
  return (
    <div className={`offer offer--${type}`} style={{ height: amount * 2 }}>
      {matchedAmount ? (
        <span
          className="offer__matched"
          style={{ height: matchedAmount * 2 }}
        ></span>
      ) : null}
      <div className={textClass}>{name || ""}</div>
      <div className={textClass}>{amount || ""}</div>
    </div>
  );
}
