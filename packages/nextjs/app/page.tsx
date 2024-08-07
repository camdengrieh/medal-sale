"use client";

import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Contributor } from "~~/components/sale/Contibutor";
import { Distribution } from "~~/components/sale/Distribution";
import { SaleProgress } from "~~/components/sale/Progress";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";
import { useWatchBalance } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();

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

  return (
    <div className="flex items-center flex-col flex-grow pt-5">
      <div className="flex items-center flex-col flex-grow pt-5">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">1976 Olympic Gold Medal</span>
            <span className="block text-4xl font-bold">$MEDAL Fractional Auction</span>
          </h1>
          <p className="text-white text-lg leading-relaxed text-center max-w-2xl mx-auto mt-5">
            Welcome to the $MEDAL Fractional Auction! This project allows you to own a piece of history by participating
            in the fractional ownership of the iconic 1976 Olympic Gold Medal. Our mission is to make exclusive
            collectibles accessible to everyone. Join us in this unique opportunity to become a part-owner of this
            legendary memorabilia.
          </p>
        </div>
      </div>

      <div className="flex-grow bg-base-400 mt-5 px-8 py-4">
        <div className="flex justify-center items-center gap-12 flex-col">
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
