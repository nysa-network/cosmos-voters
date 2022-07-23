#!/usr/bin/env node

import * as fs from "fs";

import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";

import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

// https://registry.cosmos.griko.id/juno

import { StargateClient } from "@cosmjs/stargate";

yargs(hideBin(process.argv))
  .command(
    "get-voters",
    "get voters from proposals",
    {
      rpc_endpoint: {
        required: true,
      },
      min_height: {
        default: 0,
      },
      max_height: {
        default: undefined,
      },
    },
    get_voters
  )
  .alias({ h: "help" }).argv;

async function get_voters(argv: any) {
  let { rpc_endpoint, min_height, max_height } = argv;

  var client = await StargateClient.connect(rpc_endpoint);

  const chain_id = await client.getChainId();

  if (!fs.existsSync(`out/${chain_id}`)) {
    fs.mkdirSync(`out/${chain_id}`, { recursive: true });
  }

  if (!max_height) {
    const block = await client.getBlock();
    max_height = block.header.height;
  }

  let proposals = {};

  while (min_height < max_height) {
    const results = await client.searchTx(
      {
        tags: [{ key: "message.action", value: "/cosmos.gov.v1beta1.MsgVote" }],
      },
      {
        minHeight: min_height,
        maxHeight: min_height + 10_000,
      }
    );

    for (const res of results) {
      const raw_log = JSON.parse(res.rawLog);

      const proposal_id = raw_log[0].events
        .find((x: any) => x.type === "proposal_vote")
        ?.attributes.find((x: any) => x.key === "proposal_id")?.value;

      const voter = raw_log[0].events
        .find((x: any) => x.type === "message")
        ?.attributes.find((x: any) => x.key === "sender")?.value;

      // @ts-ignore
      if (!proposals[proposal_id]) {
        // @ts-ignore
        proposals[proposal_id] = [];
      }
      // @ts-ignore
      proposals[proposal_id].push(voter);
    }

    console.log(
      `${min_height} / ${max_height}, ${results.length} results found`
    );

    min_height += 10_000;

    for (const prop_id of Object.keys(proposals)) {
      try {
        fs.writeFileSync(
          `out/${chain_id}/proposal_${prop_id}.json`,
          // @ts-ignore
          JSON.stringify(proposals[prop_id as any], null, 4)
        );
      } catch (err) {
        console.error(err);
      }
    }
  }
}
