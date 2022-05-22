/*
  Warnings:

  - The values [credito] on the enum `Categorias_tipo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `credito` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `credito` DROP FOREIGN KEY `Credito_id_cartao_fkey`;

-- DropForeignKey
ALTER TABLE `credito` DROP FOREIGN KEY `Credito_id_categoria_fkey`;

-- AlterTable
ALTER TABLE `categorias` MODIFY `tipo` ENUM('contas', 'debitos', 'creditos') NOT NULL;

-- DropTable
DROP TABLE `credito`;

-- CreateTable
CREATE TABLE `Creditos` (
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

-- AddForeignKey
ALTER TABLE `Creditos` ADD CONSTRAINT `Creditos_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `Categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Creditos` ADD CONSTRAINT `Creditos_id_cartao_fkey` FOREIGN KEY (`id_cartao`) REFERENCES `Cartao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
