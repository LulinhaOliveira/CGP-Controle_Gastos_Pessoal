-- DropForeignKey
ALTER TABLE `contas` DROP FOREIGN KEY `Contas_id_categoria_fkey`;

-- DropForeignKey
ALTER TABLE `credito` DROP FOREIGN KEY `Credito_id_categoria_fkey`;

-- DropForeignKey
ALTER TABLE `debitos` DROP FOREIGN KEY `Debitos_id_categoria_fkey`;

-- AddForeignKey
ALTER TABLE `Debitos` ADD CONSTRAINT `Debitos_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `Categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contas` ADD CONSTRAINT `Contas_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `Categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Credito` ADD CONSTRAINT `Credito_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `Categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
