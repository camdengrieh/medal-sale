import { useScaffoldReadContract } from "../scaffold-eth";

const useSaleActivity = (saleAddress: string) => {
  // const saleContract = {
  //   address: saleAddress as string,
  //   abi: parseAbi([
  //     "event TokensBought(address indexed buyer, uint256 ethSpent, uint256 tokensReceived)",
  //     "event TokensSold(address indexed seller, uint256 ethReceived, uint256 tokensSold)",
  //   ]),
  // } as const;

  // const { data: tokensBought } = useScaffoldEventHistory({
  //   contractName: "MedalSaleReader",
  //   eventName: "Bought",
  //   fromBlock: blockNumber ? blockNumber - 1000n : 0n,
  //   receiptData: true,
  //   watch: true,
  // });

  const { data: buyersBalances } = useScaffoldReadContract({
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
    //tokensBought,
    buyers,
    buyersBalances,
  };
};

export default useSaleActivity;
