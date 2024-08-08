"use client";

import { Balance } from "../scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

type SaleProgressProps = {
  saleBalance: number;
  saleAddress: string;
};

export const SaleProgress = ({ saleBalance, saleAddress }: SaleProgressProps) => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  return (
    <div className="bg-base-300 shadow-xl p-8 relative z-10 max-sm w-full md:w-[612px] animate-gold-border">
      <div className="animate-border-child">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-br from-yellow-500 via-amber-200 to-amber-400 bg-clip-text text-transparent">
          AUCTION STATS
        </h1>
        <p className="text-sm mb-2 text-white text-center">Projected market values based on current contributions.</p>
        <div className="flex flex-row justify-center items-center">
          <div className="text-xl text-white text-center">RAISED: </div>
          <Balance className="text-lg text-white text-center" address={saleAddress} />
        </div>

        <div className="flex flex-row justify-center gap-4 mt-2">
          <div className="text-xl text-white text-center">CIRC. MARKETCAP: </div>
          <span className="text-lg text-white text-center">
            ${(saleBalance * nativeCurrencyPrice * 2).toLocaleString()}
          </span>
        </div>
        <div className="flex flex-row justify-center gap-4 mt-2">
          <div className="text-xl text-white text-center">FDV:</div>
          <span className="text-lg text-white text-center">
            ${(saleBalance * nativeCurrencyPrice * 5).toLocaleString()}
          </span>
        </div>
        <span className="flex text-sm text-gray-500 text-center justify-center w-full">
          (If complete token supply was in circulation)
        </span>
      </div>
    </div>
  );
};
