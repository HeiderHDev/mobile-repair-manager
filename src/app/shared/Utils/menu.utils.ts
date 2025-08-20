import { MenuItem } from "../interfaces/menu/menu-item.interface";

export class MenuUtils {
    static createMenuItem(
      id: string,
      label: string,
      icon: string,
      route?: string,
      options?: Partial<MenuItem>
    ): MenuItem {
      return {
        id,
        label,
        icon,
        route,
        visible: true,
        ...options
      };
    }
  
    static filterVisibleItems(items: MenuItem[]): MenuItem[] {
      return items.filter(item => item.visible !== false);
    }
  
    static findActiveItem(items: MenuItem[], currentRoute: string): MenuItem | null {
      return items.find(item => item.route === currentRoute) || null;
    }
}