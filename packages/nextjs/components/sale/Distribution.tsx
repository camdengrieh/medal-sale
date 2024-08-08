import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";

type DistributionProps = {
  buyers: string[];
  buyersContributions: bigint[];
  totalRaised: number;
};

export const Distribution = ({ buyersContributions, buyers, totalRaised }: DistributionProps) => {
  //total supply is 20 million
  const totalSupply = 20000000;
  //const { data: tokenContract } = useScaffoldContract({ contractName: "Olympic1976GoldFragments"});

  return (
    <div className="card card-body bg-base-300 flex flex-col shadow-xl w-full md:w-[612px] animate-gold-border">
      <div className="animate-border-child h-72 overflow-y-scroll">
        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-br from-yellow-500 via-amber-200 to-amber-400 bg-clip-text text-transparent">
          Distribution
        </h1>
        <div className="flex flex-col gap-y-2 justify-center items-center pt-30 overflow-y-scroll">
          {buyersContributions &&
            buyers &&
            buyersContributions
              .map((balance, index) => ({ balance, index })) // Map to an array of objects with balance and index
              .sort((a, b) => Number(b.balance) - Number(a.balance)) // Sort by balance in descending order
              .map(({ balance, index }) => {
                // percentage of total supply
                const buyerPercentage = (Number(formatEther(balance)) / totalRaised) * 100;
                const estimatedTokens = (Number(formatEther(balance)) / totalRaised) * totalSupply;
                return (
                  <div key={index} className="flex flex-row gap-x-1 items-center">
                    <Address address={buyers[index]} />
                    <div>
                      <span className="max-sm:hidden">{Number(formatEther(balance)).toLocaleString()} ETH | </span>
                      <span className="gold-gradient-text">
                        {Number(estimatedTokens.toFixed(0)).toLocaleString()} $MEDAL
                      </span>
                      <span className="max-sm:hidden"> | {Number(buyerPercentage).toFixed(2)}% </span>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};
