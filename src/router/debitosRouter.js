import express from "express";
import DebitosController from "../controller/debitosController.js";

const debitosController = new DebitosController();

const router = express.Router();


router.get("/cgp/debito/:id", debitosController.getOne); //Pergar um debito do Usuario
router.post("/cgp/debito", debitosController.store); //Cria um debito Para o Usuario
router.get("/cgp/debito", debitosController.getAll); //Pega todos debito do Usuario
router.delete("/cgp/debito/:id", debitosController.remove); //Deletar um debito



export default router;
