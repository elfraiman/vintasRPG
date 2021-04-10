import { EquipSlotTypes, Item, ItemType } from '@prisma/client';
import prisma from "./prisma";

export interface IPlayerEquip {
    id: number
    playerId: number
    itemId: number
    slotId: number
    slot: EquipSlotTypes
    item: IItem
}


export interface IItem {
  id: number
  name: string
  weight: number
  maximumStack: number
  minDamage: number | null
  maxDamage: number | null
  attackSpeed: number | null
  cost: number | null
  armor: number | null
  tier: string | null
  description: string | null
  itemTypeId: number
  imageName: string | null
  effectAmount: number
  itemType: ItemType
}

export interface IInventory {
    id: number
    itemId: number
    itemQuantity: number
    playerId: number
    item: IItem
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
