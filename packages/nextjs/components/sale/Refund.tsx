import { formatEther, parseEther } from "viem";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type RefundProps = {
  isConnected: boolean;
  userAddress: string;
  saleBalance: number;
};

export const Refund = ({ isConnected, userAddress, saleBalance }: RefundProps) => {
  const { userContribution, userBonus } = useSaleContractInfo(userAddress);
  const totalContribution = formatEther((userContribution || 0n) + (userBonus || 0n));
  const percentageOfSale = (Number(totalContribution) / saleBalance) * 100;

  const { writeContractAsync: refund } = useScaffoldWriteContract("MedalSale");

  const handleRefund = async () => {
    try {
      await refund({
        functionName: "refund",
      });
    } catch (error) {
      console.error("Error refunding tokens", error);
    }
  };
  return (
    <div className="flex justify-center py-10 relative animate-gold-border w-screen md:w-[612px]">
      <div className="w-4/5 shadow-xl p-8 z-10 animate-border-child ">
        <h1 className="text-3xl font-bold mb-4 text-center gold-gradient-text">REFUNDING</h1>
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
          <div className="flex flex-col items-center">
            <button onClick={handleRefund} disabled={parseEther(totalContribution) === 0n} className="btn-primary-gold">
              Claim Refund 🥇
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-6">
            <RainbowKitCustomConnectButton />
          </div>
        )}
        <p className="mt-5 text-xs md:text-sm gold-gradient-text text-center">
          Note: Thank you for your participation in the auction. Despite not achieving the result we were all hoping
          for, we are still committed to delivering value and something in the near future to all people in support of
          the project. Contributors may be rewarded.
          <br />
          <br />
          You will receive a refund of your total contribution immediately after processing and confirimnig the refund
          transaction.
        </p>
      </div>
    </div>
  );
};
