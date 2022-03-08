import express from "express";
import UserRouter from "../router/userRouter.js";
import AuthorizationMiddleware  from "../middleware/authorization_middleware.js";
import ControlAcessMiddleware from "../middleware/control_acess_middleware.js";
import morgan from "morgan";
import consign from "consign";


const appX = express();  
appX.use(express.json());
appX.use(morgan("dev"));
appX.use(AuthorizationMiddleware);
appX.use(ControlAcessMiddleware);
appX.use(UserRouter);


export const app = appX;


    

   