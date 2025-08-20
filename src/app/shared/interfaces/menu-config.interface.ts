import { MenuItem } from "./menu-item.interface";

export interface MenuConfig {
    items: MenuItem[];
    collapsed?: boolean;
}