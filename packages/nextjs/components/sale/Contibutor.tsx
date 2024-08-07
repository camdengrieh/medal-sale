import { formatEther } from "viem";
import useSaleContractInfo from "~~/hooks/sale/useSaleContract";

type ContributorProps = {
  userAddress: string;
  saleBalance: number;
};

export const Contributor = ({ userAddress, saleBalance }: ContributorProps) => {
  const { userContribution, userBonus } = useSaleContractInfo(userAddress);

  const totalContribution = formatEther((userContribution || 0n) + (userBonus || 0n));
  const percentageOfSale = (Number(totalContribution) / saleBalance) * 100;

  return (
    <div className="card card-body flex flex-col text-center bg-base-300 shadow-xl">
      <div className="text-2xl">Your total contribution: </div>
      <span className="text-xl"> {formatEther(userContribution || 0n)} ETH</span>
      {userBonus != 0n && (
        <>
          <div className="text-2xl">Bonus Contribution: </div>
          <span className="text-xl"> {formatEther(userBonus || 0n)} ETH</span>
        </>
      )}
      <div className="text-2xl">Percentage of Sale Owned: </div>
      <span className="text-xl">{percentageOfSale}%</span>
      <span className="text-sm">(subject to change)</span>
    </div>
  );
};
