"use client";

import { Address } from "~~/components/scaffold-eth";
import useTokenContractInfo from "~~/hooks/token/useTokenInfo";

export const TokenInfo = ({ tokenAddress }: { tokenAddress: string; saleAddress: string }) => {
  const { tokenName, tokenSymbol, tokenError, tokenInfoLoading } = useTokenContractInfo(tokenAddress as string);

  if (tokenError) {
    return <div>Error loading contract data</div>;
  }
  if (tokenInfoLoading) {
    return <div className="skeleton bg-base-200 h-3 w-full"></div>;
  }
  return (
    <div className="flex">
      <div className="flex flex-col text-center">
        <span>
          {tokenSymbol} | {tokenName}
        </span>
        <span className="flex flex-row gap-x-2">
          Address: <Address address={tokenAddress} />{" "}
        </span>
      </div>
    </div>
  );
};
