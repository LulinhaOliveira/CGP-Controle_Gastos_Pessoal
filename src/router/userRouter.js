import express from "express";
import UserController from "../controller/UserController.js";

const userController = new UserController();

const router = express.Router();

router.get("/cgp/users", userController.getOne);
router.get("/cgp/usersData", userController.getOneUserData);
router.post("/cgp/users", userController.store);
router.put("/cgp/users", userController.uptadeAll);
router.delete("/cgp/users/:id", userController.remove);
router.patch("/cgp/users/saldo_mensal/:id", userController.updateSaldo_Mensal);
router.patch("/cgp/users/data_rec/:id", userController.updateDate_Rece);
router.post("/cgp/login", userController.login);

export default router;
