import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { parseAbi } from "viem";
import { useReadContracts } from "wagmi";

const useSaleContractInfo = (userAddress: string) => {
  const { data: saleContractInfo } = useDeployedContractInfo("MedalSale");

  const saleAddress = saleContractInfo?.address;
  const saleContract = {
    address: saleAddress as string,
    abi: parseAbi([
      "function addressTokenBalances(address) view returns (uint256)",
      "function tokensPerEth() view returns (uint256)",
      "function ethRaised() view returns (uint256)",
      "function addressEthSpent(address) view returns (uint256)",
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
        functionName: "addressTokenBalances",
        args: [userAddress as string],
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
    pricePerToken: saleInfo && saleInfo[0].result,
    tokenBalance: saleInfo && saleInfo[1].result,
    ethRaised: saleInfo && saleInfo[2].result,
    ethSpent: saleInfo && saleInfo[3].result,
    buyers,
    buyersBalances,
    buyerContributions,
  };
};

export default useSaleContractInfo;
