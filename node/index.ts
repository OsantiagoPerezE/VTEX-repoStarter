import { method, Service } from "@vtex/api";
import type { ParamsContext, RecorderState } from "@vtex/api";

import { Clients } from "./clients";
import { health } from "./middlewares/health";
import { estimateShipping } from "./resolvers/estimateShipping";

export default new Service<Clients, RecorderState, ParamsContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        retries: 2,
        timeout: 10000,
      },
    },
  },
  routes: {
    health: method({
      GET: [health],
    }),
  },
  graphql: {
    resolvers: {
      Query: {
        estimateShipping,
      },
    },
  },
});
