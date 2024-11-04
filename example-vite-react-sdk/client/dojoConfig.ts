import { createDojoConfig } from "@dojoengine/core";
import manifest from "../dojo-starter/manifest_dev.json";

console.log("Loading manifest:", manifest);

const config = {
  manifest,
  rpcUrl: "http://localhost:5050",
  toriiUrl: "http://localhost:8080",
  relayUrl: "/dns4/localhost/tcp/8080/http/p2p-webrtc-star",
  masterAddress: "0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973",
  masterPrivateKey: "0x1800000000300000180000000000030000000000003006001800006600",
  contractAddress: manifest.world.address,
};

console.log("Dojo config:", config);

export const dojoConfig = createDojoConfig(config);