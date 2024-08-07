import { Balance } from "../scaffold-eth";
import Countdown from "react-countdown";
import { useGlobalState } from "~~/services/store/store";

type SaleProgressProps = {
  saleBalance: number;
  saleAddress: string;
};

export const SaleProgress = ({ saleBalance, saleAddress }: SaleProgressProps) => {
  const Completionist = () => <span>You are good to go!</span>;
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  // Renderer callback with condition
  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <div className="text-xl text-white text-center">
          {days}d, {hours}h, {minutes}m, {seconds}s
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-5xl bg-base-300 shadow-xl p-8 relative z-10 neon-border">
      <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-br from-yellow-500 via-amber-200 to-amber-400 bg-clip-text text-transparent">
        AUCTION STATS
      </h1>
      <p className="text-lg mb-6 text-white text-center">
        Monitor the progress of the auction with live updates. Track the total value raised, countdown to the end of the
        auction, and projected market values based on current contributions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-xl text-white text-center">ETH RAISED:</div>
        <Balance className="text-lg text-white text-center" address={saleAddress} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="text-xl text-white text-center">ENDS IN:</div>
        <Countdown
          className="text-lg text-white text-center"
          date={1724328419000}
          renderer={renderer}
          intervalDelay={0}
        >
          <span className="text-white">Auction has finished!</span>
        </Countdown>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="text-xl text-white text-center">MARKETCAP (AT LAUNCH):</div>
        <span className="text-lg text-white text-center">
          ${(saleBalance * nativeCurrencyPrice * 2).toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="text-xl text-white text-center">FULLY DILUTED VALUATION:</div>
        <span className="text-lg text-white text-center">
          ${(saleBalance * nativeCurrencyPrice * 5).toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 text-center w-full">(If complete token supply was in circulation)</span>
      </div>
    </div>
  );
};
