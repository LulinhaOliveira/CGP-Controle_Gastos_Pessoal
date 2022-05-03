import express from "express";
import UserRouter from "../router/userRouter.js";
import CateogriasRouter from "../router/categoriaRouter.js";
import CartoesRouter from "../router/cartoesRouter.js";
import CreditoRouter from "../router/creditoRouter.js";
import DebitosRouter from "../router/debitosRouter.js";
import ContasRouter from "../router/contasRouter.js";
import AuthorizationMiddleware from "../middleware/authorization_middleware.js";
import ControlAcessMiddleware from "../middleware/control_acess_middleware.js";
import morgan from "morgan";
import cors from "cors";

const appX = express();
appX.use(express.json());
appX.use(morgan("dev"));
appX.use(cors());
appX.use(AuthorizationMiddleware);
appX.use(ControlAcessMiddleware);
appX.use(UserRouter);
appX.use(CateogriasRouter);
appX.use(CartoesRouter);
appX.use(CreditoRouter);
appX.use(DebitosRouter);
appX.use(ContasRouter);

export const app = appX;
