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
        <span className="text-xl">
          {days} Days : {hours} Hours : {minutes} Minutes : {seconds} Seconds
        </span>
      );
    }
  };
  return (
    <div className="card card-body flex flex-col justify-center text-center bg-base-300 shadow-xl">
      <div className="flex flex-col justify-center">
        <div className="text-2xl">Value Raised: </div>
        <Balance className="text-xl" address={saleAddress} />
      </div>
      <div className="flex flex-col ">
        <div className="text-2xl">Auction ends in: </div>
        <Countdown className="text-xl" date={1724328419000} renderer={renderer} intervalDelay={0}>
          <span>Auction has finished!</span>
        </Countdown>
      </div>
      <div className="flex flex-col ">
        <div className="text-2xl">Circulating Marketcap (at launch): </div>
        <span className="text-xl"> ${(saleBalance * nativeCurrencyPrice * 2).toLocaleString()}</span>
      </div>
      <div className="flex flex-col ">
        <div className="text-2xl">Fully Diluted Valuation: </div>
        <span className="text-xl"> ${(saleBalance * nativeCurrencyPrice * 5).toLocaleString()}</span>
        <span className="text-sm">(If all tokens were in circulation)</span>
      </div>
    </div>
  );
};
