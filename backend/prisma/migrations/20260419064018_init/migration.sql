-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('HOME_USER', 'ADMIN', 'COLLECTOR', 'BUYER') NOT NULL DEFAULT 'HOME_USER',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationToken` VARCHAR(191) NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScrapRequest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `collectorId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'QUOTED', 'REJECTED', 'SCHEDULED', 'COLLECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `items` JSON NOT NULL,
    `photos` JSON NOT NULL,
    `pickupAddress` VARCHAR(191) NOT NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `adminPrice` DECIMAL(65, 30) NULL,
    `adminNotes` VARCHAR(191) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `scheduledDate` DATETIME(3) NULL,
    `receiptPath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ScrapRequest_userId_idx`(`userId`),
    INDEX `ScrapRequest_collectorId_idx`(`collectorId`),
    INDEX `ScrapRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `materialType` ENUM('STEEL', 'COPPER', 'ALUMINIUM', 'BRASS', 'PLASTIC', 'PET_BOTTLES', 'CARDBOARD', 'PAPER', 'GLASS', 'EWASTE') NOT NULL,
    `weightKg` DECIMAL(65, 30) NOT NULL,
    `pricePerKg` DECIMAL(65, 30) NOT NULL,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Inventory_requestId_key`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuyerOrder` (
    `id` VARCHAR(191) NOT NULL,
    `buyerId` VARCHAR(191) NOT NULL,
    `inventoryId` VARCHAR(191) NOT NULL,
    `quantityKg` DECIMAL(65, 30) NOT NULL,
    `totalPrice` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('PLACED', 'CONFIRMED', 'DELIVERED') NOT NULL DEFAULT 'PLACED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BuyerOrder_buyerId_idx`(`buyerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_read_idx`(`read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Feedback_requestId_key`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScrapRequest` ADD CONSTRAINT `ScrapRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScrapRequest` ADD CONSTRAINT `ScrapRequest_collectorId_fkey` FOREIGN KEY (`collectorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `ScrapRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuyerOrder` ADD CONSTRAINT `BuyerOrder_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuyerOrder` ADD CONSTRAINT `BuyerOrder_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `ScrapRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
