"use client";

import type { NextPage } from "next";
import Countdown from "react-countdown";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Contributor } from "~~/components/sale/Contibutor";
import { Distribution } from "~~/components/sale/Distribution";
import { SaleProgress } from "~~/components/sale/Progress";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";
import { useWatchBalance } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();

  const endTimestamp = 1724328419000;

  const { saleAddress, buyers, buyerContributions } = useSaleContractInfo(connectedAddress as string);

  const {
    data: totalRaised,
    isError,
    isLoading,
  } = useWatchBalance({
    address: saleAddress,
  });
  const formattedBalance = totalRaised ? Number(formatEther(totalRaised?.value)) : 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error...</div>;
  }

  const Completionist = () => <span>You can now claim your token allocation!</span>;

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
    <div className="flex items-center flex-col flex-grow pt-5 overflow-hidden">
      <div className="flex items-center flex-col flex-grow pt-5">
        <div className="flex flex-col justify-center items-center px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">OWN A PIECE OF HISTORY</span>
            <span className="block text-4xl font-bold">
              <span className="gold-gradient-text">$MEDAL</span> Auction
            </span>
          </h1>
          <p className="text-white font-bold max-sm:text-sm text-md leading-relaxed text-center max-w-2xl mx-auto mt-5">
            Learn more about the 1976 Olympic Gold Medal and how we&apos;re making ownership of this rare piece of
            history accessible to everyone, in our{" "}
            <a
              href="https://1976medal.medium.com/broken-history-or-breaking-history-1976-olympic-gold-medal-auctioned-off-in-100-million-pieces-2b5ae52706cd"
              className="link"
            >
              Medium
            </a>
          </p>

          <div className="gold-card mt-2">
            <div className="flex flex-col justify-center animate-border-child">
              <div className="text-xl gold-gradient-text text-center">ENDS IN:</div>
              <Countdown className="text-lg text-white text-center" date={endTimestamp} renderer={renderer}>
                <span className="text-white">Auction has finished!</span>
              </Countdown>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-base-400 px-8 py-4">
        <div className="flex justify-center gap-4 flex-col overflow-hidden">
          <Contributor isConnected={isConnected} userAddress={connectedAddress ?? ""} saleBalance={formattedBalance} />
          <SaleProgress saleAddress={saleAddress as string} saleBalance={formattedBalance} />
          <Distribution
            buyers={buyers as string[]}
            totalRaised={formattedBalance}
            buyersContributions={buyerContributions as bigint[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
