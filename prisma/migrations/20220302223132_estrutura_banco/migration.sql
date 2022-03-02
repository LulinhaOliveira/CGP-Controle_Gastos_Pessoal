/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `dat_nasc` DATETIME(3) NULL,
    `saldo_mensal` DOUBLE NULL DEFAULT 0,
    `saldo_resto` DOUBLE NULL,
    `dat_recebe` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categorias` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `valor_planejado` DOUBLE NOT NULL,
    `valor_atual` DOUBLE NOT NULL DEFAULT 0,
    `tipo` ENUM('contas', 'debitos', 'credito') NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Categorias_nome_id_user_key`(`nome`, `id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Debitos` (
    `id` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `dat_hora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `desc` VARCHAR(191) NULL,
    `id_categoria` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contas` (
    `id` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `dat_vencimento` DATETIME(3) NULL,
    `dat_hora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `desc` VARCHAR(191) NULL,
    `id_categoria` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Credito` (
    `id` VARCHAR(191) NOT NULL,
    `num_parcelas` INTEGER NOT NULL,
    `valor_total` DOUBLE NOT NULL,
    `valor_parcela` DOUBLE NULL,
    `dat_hota` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `desc` VARCHAR(191) NULL,
    `id_categoria` VARCHAR(191) NOT NULL,
    `id_cartao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cartao` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `saldo_parcelado` DOUBLE NOT NULL DEFAULT 0,
    `dat_ven` DATETIME(3) NULL,
    `id_user` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Cartao_nome_id_user_key`(`nome`, `id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Categorias` ADD CONSTRAINT `Categorias_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Debitos` ADD CONSTRAINT `Debitos_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `Categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contas` ADD CONSTRAINT `Contas_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `Categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Credito` ADD CONSTRAINT `Credito_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `Categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Credito` ADD CONSTRAINT `Credito_id_cartao_fkey` FOREIGN KEY (`id_cartao`) REFERENCES `Cartao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cartao` ADD CONSTRAINT `Cartao_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
