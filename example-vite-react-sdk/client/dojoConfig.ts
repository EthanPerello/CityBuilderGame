import { createDojoConfig } from "@dojoengine/core";
import manifest from "../dojo-starter/manifest_dev.json";

const config = {
  manifest,
  rpcUrl: "https://api.cartridge.gg/x/my-city-builder/katana",
  // Update Torii URL to use the deployed endpoint
  toriiUrl: "https://api.cartridge.gg/x/my-city-builder/torii",
  // Update to use the GraphQL endpoint for queries
  graphqlUrl: "https://api.cartridge.gg/x/my-city-builder/torii/graphql",
  // Update world address from your deployment
  contractAddress: "0x6171ed98331e849d6084bf2b3e3186a7ddf35574dd68cab4691053ee8ab69d7",
  // Remove master address and private key for production deployment
  // masterAddress and masterPrivateKey should only be used for local development
};

console.log("Dojo config:", config);
export const dojoConfig = createDojoConfig(config);