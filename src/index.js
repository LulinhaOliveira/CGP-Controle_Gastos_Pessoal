import express from "express";
import dotenv from "dotenv";
import prisma from '@prisma/client';
const prismaClient = new prisma.PrismaClient();

dotenv.config();
const { PORT } = process.env;



(async () => {
  try {
    await prismaClient.user.create({
      data: {
      email : "lulinhaoliveirademelo@gmail.com",
      password : "testeteste",
      nome : "Luiz Oliveira"
      }
    })
  }catch(erro){
    console.log(erro)
  }
 
})()

