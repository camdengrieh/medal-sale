import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";

type DistributionProps = {
  saleAddress: string;
  tokenAddress: string;
};

export const Distribution = ({ saleAddress }: DistributionProps) => {
  const { buyers, buyersBalances } = useSaleContractInfo(saleAddress);
  //total supply is 1 billion
  const totalSupply = 1000000000;

  return (
    <div className="flex flex-col p-2">
      <h1 className="text-xl text-center">Distribution</h1>
      <div className="flex flex-col gap-y-2 justify-center">
        {buyersBalances &&
          buyers &&
          buyersBalances.map((balance: bigint, index: number) => {
            // percentage of total supply
            const buyerPercentage = (Number(formatEther(balance)) / totalSupply) * 100;
            return (
              <div key={index} className="flex flex-row gap-x-1 items-center">
                <Address size="xs" address={buyers[index]} />
                <div>
                  {Number(formatEther(balance)).toLocaleString()} | {Number(buyerPercentage).toFixed(2)}%
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
