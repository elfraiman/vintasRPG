import prisma from "./prisma";
import { EquipSlotTypes, Inventory, Item, PlayerEquip, Prisma } from '@prisma/client'

export interface IPlayerEquip {
    id: number
    playerId: number
    itemId: number
    slotId: number
    slot: EquipSlotTypes
    item: Item
}

export interface IInventory {
    id: number
    itemId: number
    itemQuantity: number
    playerId: number
    item: Item
}


export interface IPlayer {
    id: number
    name: string | null
    userId: number
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    weightLimit: number
    health: number
    maxHealth: number
    defense: number
    damageReduction: number
    evasion: number
    experience: number
    experienceToLevelUp: number
    level: number
    maxInventorySlots: number
    gold: number
    inventoryId: number
    equipement: IPlayerEquip[]
    inventory: IInventory[]
}


export const getPlayer = async (userId) => {
  const player: IPlayer = await prisma.player?.findFirst({
    where: { userId: userId },
    include: {
      equipement: {
        include: { item: { include: { itemType: true } }, slot: true },
      },
      inventory: {
        include: { item: { include: { itemType: true } } },
      },
    },
  });

  return player;
};
