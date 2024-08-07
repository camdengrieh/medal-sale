"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useBalance } from "wagmi";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import useTokenContractInfo from "~~/hooks/token/useTokenInfo";

type TradeCardProps = {
  connectedAddress: string;
};

export const TradeCard = ({ connectedAddress }: TradeCardProps) => {
  const { saleInfoLoading, ethSpent } = useSaleContractInfo(connectedAddress);
  const { data: medalContract } = useDeployedContractInfo("Olympic1976GoldFragments");
  const { tokenInfoLoading } = useTokenContractInfo(medalContract?.address as string);
  const [selectedBuyAmount, setSelectedBuyAmount] = useState("0.001");
  const { data: balance } = useBalance({ address: connectedAddress as `0x${string}` });

  const { writeContractAsync: buyToken } = useScaffoldWriteContract("MedalSale");

  const setMaxBuyAmount = () => {
    if (!balance || !ethSpent) return;
    setSelectedBuyAmount(formatEther(balance?.value as bigint));
  };

  if (tokenInfoLoading || saleInfoLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex card card-body bg-base-300 shadow-xl">
      <div className="flex flex-col justify-center">
        <div className="flex flex-row gap-x-2 justify-center items-center">
          <label className="input flex items-center gap-2 w-60">
            ETH:
            <input
              type="number"
              value={selectedBuyAmount}
              onChange={e => setSelectedBuyAmount(e.target.value)}
              className="grow"
              min={0.001}
              max={0.1}
              placeholder="0.01"
            />{" "}
            <button onClick={() => setMaxBuyAmount()} className="btn btn-sm btn-primary">
              {" "}
              Max
            </button>
          </label>

          <button
            onClick={async () => {
              try {
                await buyToken({
                  functionName: "buyTokens",
                  value: parseEther(selectedBuyAmount) as any,
                });
              } catch (error) {
                console.error("Error buying token", error);
              }
            }}
            disabled={parseEther(selectedBuyAmount) > (balance?.value as bigint)}
            className="btn glass btn-primary btn-sm"
          >
            Contribute 🥇
          </button>
        </div>
        {parseEther(selectedBuyAmount) > (balance?.value as bigint) && (
          <div className="text-center text-red-500">Insufficient balance</div>
        )}
      </div>
    </div>
  );
};
