import express from "express";
import CartoesController from "../controller/cartoesController.js";

const cartoesController = new CartoesController();

const router = express.Router();


router.get("/cgp/cartoes/:id", cartoesController.getOne); //Pergar um cartao do Usuario
router.post("/cgp/cartoes", cartoesController.store); //Cria um cartao Para o Usuario
router.get("/cgp/cartoes", cartoesController.getAll); //Pega todos cartoes do Usuario
router.put("/cgp/cartoes/:id", cartoesController.uptadeAll); //Atualiza os dados nome,  dt_ven planejado
router.delete("/cgp/cartoes/:id", cartoesController.remove); //Deletar um cartao



export default router;
