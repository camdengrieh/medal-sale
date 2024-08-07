"use client";

import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Contributor } from "~~/components/sale/Contibutor";
import { Distribution } from "~~/components/sale/Distribution";
import { SaleProgress } from "~~/components/sale/Progress";
import { TradeCard } from "~~/components/sale/TradeCard";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";
import { useWatchBalance } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

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
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">1976 Olympic Gold Medal</span>
          <span className="block text-4xl font-bold">$MEDAL Fractional Auction</span>
        </h1>
      </div>

      <div className="flex-grow bg-base-400 mt-5 px-8 py-4">
        <div className="flex justify-center items-center gap-12 flex-col">
          {connectedAddress ? (
            <>
              <Contributor userAddress={connectedAddress} saleBalance={formattedBalance} />
              <TradeCard connectedAddress={connectedAddress} />{" "}
            </>
          ) : (
            <RainbowKitCustomConnectButton />
          )}
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
