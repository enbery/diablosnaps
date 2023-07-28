import { Class } from './character';
import { AffixId, Language } from './shared';
export declare enum ItemType {
    Axe = "Axe",
    Axe2H = "Axe2H",
    Bow = "Bow",
    Crossbow = "Crossbow",
    Crossbow2H = "Crossbow2H",
    Dagger = "Dagger",
    Focus = "Focus",
    Mace = "Mace",
    Mace2H = "Mace2H",
    Scythe = "Scythe",
    Scythe2H = "Scythe2H",
    Staff = "Staff",
    Sword = "Sword",
    Sword2H = "Sword2H",
    Polearm = "Polearm",
    Wand = "Wand",
    Amulet = "Amulet",
    Boots = "Boots",
    ChestArmor = "ChestArmor",
    Gloves = "Gloves",
    Helm = "Helm",
    Legs = "Legs",
    Ring = "Ring",
    Shield = "Shield"
}
export declare enum ItemQuality {
    Common = "Normal",
    Magic = "Magic",
    Rare = "Rare",
    Legendary = "Legendary",
    Unique = "Unique"
}
export declare const ITEM_NAME_QUALITIES: ItemQuality[];
export declare enum ItemVariant {
    Sacred = "Sacred",
    Ancestral = "Ancestral"
}
export interface ItemAffix {
    id: AffixId;
    value?: number;
}
export interface ItemBasicAffix extends ItemAffix {
    replaced?: boolean;
}
export interface ItemLegendaryAffix extends ItemAffix {
    imprinted?: boolean;
}
export interface Item {
    language: Language;
    quality: ItemQuality;
    variant?: ItemVariant;
    id?: string;
    type?: ItemType;
    power?: number;
    requiredLevel?: number;
    classRestriction?: Class;
    accountBound?: boolean;
    inherentAffixes?: ItemBasicAffix[];
    affixes?: ItemBasicAffix[];
    legendaryAffix?: ItemLegendaryAffix;
    uniqueAffix?: ItemAffix;
}
//# sourceMappingURL=item.d.ts.map