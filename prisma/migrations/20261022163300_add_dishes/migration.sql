-- CreateTable
CREATE TABLE `Dish` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `restaurantId` INTEGER NOT NULL,

    INDEX `Dish_restaurantId_idx`(`restaurantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dish` ADD CONSTRAINT `Dish_restaurantId_fkey`
    FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
