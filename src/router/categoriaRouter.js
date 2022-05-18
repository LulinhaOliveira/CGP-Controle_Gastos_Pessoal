import express from "express";
import CategoriasController from "../controller/categoriasController.js";

const categoriasController = new CategoriasController();

const router = express.Router();

router.get("/cgp/categorias/:id", categoriasController.getOne); //Pergar uma Categoria do Usuario
router.post("/cgp/categorias", categoriasController.store); //Cria uma Categoria Para o Usuario
router.get("/cgp/categorias/:dat_prev/:dat_pos", categoriasController.getAll); //Pega todas Categorias do Usuario
router.put("/cgp/categorias/:id", categoriasController.uptadeAll); //Atualiza os dados nome, desc e valor planejado
router.delete("/cgp/categorias/:id", categoriasController.remove); //Deletar uma Categoria

export default router;
