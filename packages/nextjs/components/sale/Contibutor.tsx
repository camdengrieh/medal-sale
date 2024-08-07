import { Balance } from "../scaffold-eth";
import Countdown from "react-countdown";
import { formatEther } from "viem";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";

type SaleProgressProps = {
  userAddress: string;
};

export const Contributor = ({ userAddress }: SaleProgressProps) => {
  const { saleAddress, userContribution } = useSaleContractInfo(userAddress);
  const Completionist = () => <span>You are good to go!</span>;

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
    <div className="card card-body flex flex-col text-center bg-base-300 shadow-xl">
      <>
        <div className="text-2xl">Amount Contributed: </div>
        <span className="text-xl"> {formatEther(userContribution || 0n)}</span>
        <div className="text-2xl">Bonus Contribution: </div>
        <Balance className="text-xl" address={saleAddress} />
        <div className="text-2xl">Percentage of Sale owned: </div>
        <Countdown className="text-xl" date={1724328419000} renderer={renderer} intervalDelay={0}>
          <span>Auction has finished!</span>
        </Countdown>
      </>
    </div>
  );
};
