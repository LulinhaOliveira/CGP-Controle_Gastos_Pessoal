import express from "express";
import ContasController from "../controller/contasController.js";

const contasController = new ContasController();

const router = express.Router();


router.get("/cgp/contas/:id", contasController.getOne); //Pergar um contas do Usuario
router.post("/cgp/contas", contasController.store); //Cria um contas Para o Usuario
router.get("/cgp/contas", contasController.getAll); //Pega todos contas do Usuario
router.delete("/cgp/contas/:id", contasController.remove); //Deletar um contas



export default router;
