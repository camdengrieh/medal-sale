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
    <div className="w-full flex justify-center py-10 relative animate-gold-border max-w-[612px]">
      <div className="w-4/5 shadow-xl p-8 z-10 animate-border-child ">
        <h1 className="text-3xl font-bold mb-4 text-center gold-gradient-text">CONTRIBUTE</h1>
        {(userContribution as bigint) > 0n && (
          <>
            <p className="text-md mb-6 text-white text-center">
              Below are your contribution details, including the ability to contribute ETH to the auction.
            </p>
            <div className="flex gap-y-2 text-md animate-gold-border rounded-xl justify-center">
              <div className="animate-border-child ">
                <div className=" text-white text-center">
                  YOUR CONTRIBUTION: {formatEther(userContribution || 0n)} ETH
                </div>
                {userBonus !== 0n && (
                  <div className=" text-white text-center">BONUS CONTRIBUTION: {formatEther(userBonus || 0n)} ETH</div>
                )}
                <div className=" text-white text-center">PERCENT OF SALE OWNED: {percentageOfSale.toFixed(4)}%</div>
              </div>
            </div>
          </>
        )}
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
              <button onClick={setMaxBuyAmount} className="btn-primary-gold">
                Max
              </button>
            </label>
            <button
              onClick={handleBuyToken}
              disabled={parseEther(selectedBuyAmount) > (balance?.value as bigint)}
              className="btn-primary-gold"
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
        <p className="mt-1 text-sm gold-gradient-text text-center">
          Note: The amount you contribute will be used to purchase tokens at the end of the auction. What you contribute
          and receive in $MEDAL is proportionate to the percentage of the auction you have contributed. Ensure you have
          sufficient balance before proceeding.
        </p>
      </div>
    </div>
  );
};
