import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useBalance } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type ContributorProps = {
  isConnected: boolean;
  userAddress: string;
  saleBalance: number;
};

export const Contributor = ({ isConnected, userAddress, saleBalance }: ContributorProps) => {
  const { userContribution, userBonus } = useSaleContractInfo(userAddress);
  const totalContribution = formatEther((userContribution || 0n) + (userBonus || 0n));
  const percentageOfSale = (Number(totalContribution) / saleBalance) * 100;

  const [selectedBuyAmount, setSelectedBuyAmount] = useState("0.001");
  const { data: balance } = useBalance({ address: userAddress as `0x${string}` });
  const { writeContractAsync: buyToken } = useScaffoldWriteContract("MedalSale");

  const setMaxBuyAmount = () => {
    if (!balance) return;
    setSelectedBuyAmount(formatEther(balance?.value as bigint));
  };

  const handleBuyToken = async () => {
    try {
      await buyToken({
        functionName: "buyTokens",
        value: parseEther(selectedBuyAmount) as any,
      });
    } catch (error) {
      console.error("Error buying tokens", error);
    }
  };

  return (
    <div className="w-full flex justify-center py-10 relative">
      <div className="w-4/5 max-w-5xl bg-base-300 shadow-xl p-8 relative z-10 neon-border">
        <h1 className="text-3xl font-bold mb-4 text-center" style={{ color: "#FCB131" }}>
          CONTRIBUTE
        </h1>
        <p className="text-lg mb-6 text-white text-center">
          Below are your contribution details, including the ability to contribute ETH to the auction.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-xl text-white text-center">YOUR CONTRIBUTION:</div>
          <div className="text-lg text-white text-center">{formatEther(userContribution || 0n)} ETH</div>
          {userBonus !== 0n && (
            <>
              <div className="text-xl text-white text-center">BONUS CONTRIBUTION:</div>
              <div className="text-lg text-white text-center">{formatEther(userBonus || 0n)} ETH</div>
            </>
          )}
          <div className="text-xl text-white text-center">PERCENT OF SALE OWNED:</div>
          <div className="text-lg text-white text-center">{percentageOfSale.toFixed(2)}%</div>
        </div>
        {isConnected ? (
          <div className="flex flex-col items-center mt-6">
            <label className="input flex items-center gap-2 mb-4 text-white">
              ETH:
              <input
                type="number"
                value={selectedBuyAmount}
                onChange={e => setSelectedBuyAmount(e.target.value)}
                className="grow px-2 py-1 border rounded-md text-white bg-white"
                min={0.001}
                placeholder="0.01"
              />
              <button
                onClick={setMaxBuyAmount}
                className="inline-block rounded border-2 border-warning px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-warning transition duration-150 ease-in-out hover:border-warning-600 hover:bg-warning-50/50 hover:text-warning-600 focus:border-warning-600 focus:bg-warning-50/50 focus:text-warning-600 focus:outline-none focus:ring-0 active:border-warning-700 active:text-warning-700 motion-reduce:transition-none dark:hover:bg-yellow-950 dark:focus:bg-yellow-950"
                style={{ color: "#FFFFFF" }}
              >
                Max
              </button>
            </label>
            <button
              onClick={handleBuyToken}
              disabled={parseEther(selectedBuyAmount) > (balance?.value as bigint)}
              className="inline-block rounded border-2 border-warning px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-warning transition duration-150 ease-in-out hover:border-warning-600 hover:bg-warning-50/50 hover:text-warning-600 focus:border-warning-600 focus:bg-warning-50/50 focus:text-warning-600 focus:outline-none focus:ring-0 active:border-warning-700 active:text-warning-700 motion-reduce:transition-none dark:hover:bg-yellow-950 dark:focus:bg-yellow-950"
              style={{ color: "#FFFFFF" }}
            >
              Contribute 🥇
            </button>
            {parseEther(selectedBuyAmount) > (balance?.value as bigint) && (
              <div className="text-center text-red-500 mb-4">Insufficient balance</div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center mt-6">
            <RainbowKitCustomConnectButton />
          </div>
        )}
        <p className="text-sm text-gray-500 text-center">
          Note: The amount you contribute will be used to purchase tokens at the current sale rate. Ensure you have
          sufficient balance before proceeding.
        </p>
      </div>
    </div>
  );
};
