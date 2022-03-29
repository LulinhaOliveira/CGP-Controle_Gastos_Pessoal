import express from "express";
import CreditoController from "../controller/creditoController.js";

const creditoController = new CreditoController();

const router = express.Router();


router.get("/cgp/credito/:id", creditoController.getOne); //Pergar um credito do Usuario
router.post("/cgp/credito", creditoController.store); //Cria um credito Para o Usuario
router.get("/cgp/credito", creditoController.getAll); //Pega todos credito do Usuario
router.delete("/cgp/credito/:id", creditoController.remove); //Deletar um credito



export default router;
