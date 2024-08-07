import { erc20Abi } from "viem";
import { useReadContracts } from "wagmi";

const useTokenContractInfo = (tokenAddress: string) => {
  const tokenContract = {
    address: tokenAddress as string,
    abi: erc20Abi,
  } as const;

  const {
    data: tokenInfo,
    error: tokenError,
    isLoading: tokenInfoLoading,
  } = useReadContracts({
    contracts: [
      {
        ...tokenContract,
        functionName: "symbol",
      },
      {
        ...tokenContract,
        functionName: "name",
      },
      {
        ...tokenContract,
        functionName: "totalSupply",
      },
    ],
  });

  return {
    tokenInfo,
    tokenError,
    tokenInfoLoading,
    tokenSymbol: tokenInfo && tokenInfo[0].result,
    tokenName: tokenInfo && tokenInfo[1].result,
    totalSupply: tokenInfo && tokenInfo[2].result,
  };
};

export default useTokenContractInfo;
