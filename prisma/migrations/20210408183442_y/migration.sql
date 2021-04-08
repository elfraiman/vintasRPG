-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "userId" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "dexterity" INTEGER NOT NULL,
    "constitution" INTEGER NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "weightLimit" INTEGER NOT NULL DEFAULT 100,
    "health" INTEGER NOT NULL DEFAULT 10,
    "maxHealth" INTEGER NOT NULL DEFAULT 10,
    "defense" INTEGER NOT NULL,
    "damageReduction" INTEGER NOT NULL,
    "evasion" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "experienceToLevelUp" INTEGER NOT NULL DEFAULT 300,
    "level" INTEGER NOT NULL DEFAULT 1,
    "inventoryId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currenices" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaponTag" (
    "id" SERIAL NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maximumStack" INTEGER NOT NULL,
    "consumable" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "itemQuantity" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipement" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "headSlot" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minDamage" INTEGER NOT NULL,
    "maxDamage" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "tier" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dropCollections" (
    "id" INTEGER NOT NULL,
    "currenciesId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monsters" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "health" INTEGER NOT NULL,
    "maxHealth" INTEGER NOT NULL DEFAULT 10,
    "attackSpeed" INTEGER NOT NULL DEFAULT 2,
    "armor" DOUBLE PRECISION NOT NULL,
    "damageReduction" INTEGER NOT NULL,
    "evasion" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "minDamage" INTEGER NOT NULL,
    "maxDamage" INTEGER NOT NULL,
    "currencyMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.1,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "compound_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider_type" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "access_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "session_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WeaponToWeaponTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "players.name_unique" ON "players"("name");

-- CreateIndex
CREATE UNIQUE INDEX "players.userId_unique" ON "players"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Item.name_unique" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_playerId_unique" ON "inventory"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "equipement_playerId_unique" ON "equipement"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "weapons.name_unique" ON "weapons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "monsters.name_unique" ON "monsters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "accounts.compound_id_unique" ON "accounts"("compound_id");

-- CreateIndex
CREATE INDEX "providerAccountId" ON "accounts"("provider_account_id");

-- CreateIndex
CREATE INDEX "providerId" ON "accounts"("provider_id");

-- CreateIndex
CREATE INDEX "userId" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions.session_token_unique" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions.access_token_unique" ON "sessions"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "_WeaponToWeaponTag_AB_unique" ON "_WeaponToWeaponTag"("A", "B");

-- CreateIndex
CREATE INDEX "_WeaponToWeaponTag_B_index" ON "_WeaponToWeaponTag"("B");

-- AddForeignKey
ALTER TABLE "players" ADD FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipement" ADD FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dropCollections" ADD FOREIGN KEY ("currenciesId") REFERENCES "currenices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WeaponToWeaponTag" ADD FOREIGN KEY ("A") REFERENCES "weapons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WeaponToWeaponTag" ADD FOREIGN KEY ("B") REFERENCES "WeaponTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
