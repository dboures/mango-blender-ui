import { BN, Provider } from "@project-serum/anchor";
import { getMintInfo } from "@project-serum/common";
import { Pool } from "../components/Pools";
import { loadIouBalance } from "./service.balance";

export async function calculatePoolShare(provider: Provider, pool: Pool) {
    const [iouMintInfo, providerIouBalance] = await Promise.all([
        getMintInfo(provider, pool.iouMint),
        loadIouBalance(provider, pool)
    ]);

    return (providerIouBalance.amount / new BN(iouMintInfo.supply).toNumber() / 1000000); // TODO: don't like this
}