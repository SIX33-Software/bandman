import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import path from "path";

export const app = createExpressServer({
  cors: true,
  controllers: [path.join(__dirname, "/features/**/*.controller.ts")],
  currentUserChecker: async (action) => {
    return (action.request as any).user;
  },
  defaultErrorHandler: true,
});
