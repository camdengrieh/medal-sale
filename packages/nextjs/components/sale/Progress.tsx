import Countdown from "react-countdown";
import { formatEther } from "viem";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";
import { useWatchBalance } from "~~/hooks/scaffold-eth";

type SaleProgressProps = {
  userAddress: string;
};

export const SaleProgress = ({ userAddress }: SaleProgressProps) => {
  const { ethRaised, saleAddress } = useSaleContractInfo(userAddress);
  const { data: saleBalance } = useWatchBalance({ address: saleAddress as string });
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
        <span>
          {days}:{hours}:{minutes}:{seconds}
        </span>
      );
    }
  };
  return (
    <div className="flex flex-col text-center pb-3">
      {/* {pricePerToken && (
        <div>
          Price: MEDAL {pricePerToken.toLocaleString()} per ETH
        </div>
      )} */}

      <>
        <div>ETH Raised: {ethRaised == 0n ? formatEther(saleBalance?.value || 0n) : formatEther(ethRaised || 0n)}</div>
        <div>Auction ends in: </div>
        <Countdown date={1724328419000} renderer={renderer} intervalDelay={0}>
          <span>Auction has finished!</span>
        </Countdown>

        <progress
          className="progress progress-bar bg-primary "
          value={(ethRaised && ethRaised && (Number(formatEther(ethRaised)) / 2) * 100) || "0"}
          max={100}
        ></progress>
      </>
    </div>
  );
};
