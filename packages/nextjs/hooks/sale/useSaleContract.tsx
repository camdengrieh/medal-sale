import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { parseAbi } from "viem";
import { useBalance, useReadContracts } from "wagmi";

const useSaleContractInfo = (userAddress: string) => {
  const { data: saleContractInfo } = useDeployedContractInfo("MedalSale");

  const saleAddress = saleContractInfo?.address;
  const { data: saleBalance } = useBalance({ address: saleAddress as string });
  const saleContract = {
    address: saleAddress as string,
    abi: parseAbi([
      "function tokensPerEth() view returns (uint256)",
      "function ethRaised() view returns (uint256)",
      "function addressEthSpent(address) view returns (uint256)",
      "function addressBonusEarned(address) view returns (uint256)",
    ]),
  } as const;

  const { data: saleInfo, isLoading: saleInfoLoading } = useReadContracts({
    contracts: [
      {
        ...saleContract,
        functionName: "tokensPerEth",
      },
      {
        ...saleContract,
        functionName: "ethRaised",
      },
      {
        ...saleContract,
        functionName: "addressEthSpent",
        args: [userAddress as string],
      },
      {
        ...saleContract,
        functionName: "addressBonusEarned",
        args: [userAddress as string],
      },
    ],
  });

  const { data: buyersBalances } = useScaffoldReadContract({
    contractName: "MedalSaleReader",
    functionName: "getAllBuyersBalances",
    args: [saleAddress],
  });

  const { data: buyerContributions } = useScaffoldReadContract({
    contractName: "MedalSaleReader",
    functionName: "getAllBuyersBalances",
    args: [saleAddress],
  });

  const { data: buyers } = useScaffoldReadContract({
    contractName: "MedalSaleReader",
    functionName: "getBuyers",
    args: [saleAddress],
  });

  return {
    saleInfo,
    saleInfoLoading,
    saleAddress,
    tokenPerETH: saleInfo && saleInfo[0].result,
    ethRaised: saleInfo && saleInfo[1].result,
    userContribution: saleInfo && saleInfo[2].result,
    userBonus: saleInfo && saleInfo[3].result,
    buyers,
    buyersBalances,
    buyerContributions,
    saleBalance,
  };
};

export default useSaleContractInfo;
