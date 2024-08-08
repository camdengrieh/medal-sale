import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";

type DistributionProps = {
  buyers: string[];
  buyersContributions: bigint[];
  totalRaised: number;
};

export const Distribution = ({ buyersContributions, buyers, totalRaised }: DistributionProps) => {
  //total supply is 20 million
  //const totalSupply = 20000000;
  //const { data: tokenContract } = useScaffoldContract({ contractName: "Olympic1976GoldFragments"});

  return (
    <div className="card card-body bg-base-300 flex flex-col shadow-xl w-full md:w-[612px] animate-gold-border">
      <div className="animate-border-child">
        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-br from-yellow-500 via-amber-200 to-amber-400 bg-clip-text text-transparent">
          Distribution
        </h1>
        <div className="flex flex-col gap-y-2 justify-center">
          {buyersContributions &&
            buyers &&
            buyersContributions.map((balance: bigint, index: number) => {
              // percentage of total supply
              const buyerPercentage = (Number(formatEther(balance)) / totalRaised) * 100;
              return (
                <div key={index} className="flex flex-row gap-x-1 items-center">
                  <Address size="xs" address={buyers[index]} />
                  <div>
                    {Number(formatEther(balance)).toLocaleString()} ETH | {Number(buyerPercentage).toFixed(2)}%
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
