"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { SaleProgress } from "~~/components/sale/Progress";
import { TradeCard } from "~~/components/sale/TradeCard";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">1976 Olympic Gold Medal</span>
            <span className="block text-4xl font-bold">Public Fractional Auction</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-400 mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            {connectedAddress ? (
              <>
                <TradeCard connectedAddress={connectedAddress} />
                <SaleProgress userAddress={connectedAddress} />
              </>
            ) : (
              <RainbowKitCustomConnectButton />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
