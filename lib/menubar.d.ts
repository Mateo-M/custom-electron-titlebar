import { Color } from './common/color';
import { IMenuStyle } from './menu/menu';
import { Disposable } from './common/lifecycle';
import { Event } from './common/event';
export interface MenubarOptions {
    /**
     * The menu to show in the title bar.
     * You can use `Menu` or not add this option and the menu created in the main process will be taken.
     * The default menu is taken from the [`Menu.getApplicationMenu()`](https://electronjs.org/docs/api/menu#menugetapplicationmenu)
     */
    menu?: Electron.Menu | null;
    /**
     * The position of menubar on titlebar.
     * *The default is left*
     */
    menuPosition?: "left" | "bottom";
    /**
     * Enable the mnemonics on menubar and menu items
     * *The default is true*
     */
    enableMnemonics?: boolean;
    /**
     * The background color when the mouse is over the item.
     */
    itemBackgroundColor?: Color;
}
export declare class Menubar extends Disposable {
    private container;
    private options?;
    private menuItems;
    private focusedMenu;
    private focusToReturn;
    private _mnemonicsInUse;
    private openedViaKeyboard;
    private awaitingAltRelease;
    private ignoreNextMouseUp;
    private mnemonics;
    private _focusState;
    private _onVisibilityChange;
    private _onFocusStateChange;
    private menuStyle;
    constructor(container: HTMLElement, options?: MenubarOptions);
    private registerListeners;
    setupMenubar(): void;
    readonly onVisibilityChange: Event<boolean>;
    readonly onFocusStateChange: Event<boolean>;
    dispose(): void;
    blur(): void;
    setStyles(style: IMenuStyle): void;
    private updateLabels;
    private registerMnemonic;
    private hideMenubar;
    private showMenubar;
    private focusState;
    private readonly isVisible;
    private readonly isFocused;
    private readonly isOpen;
    private setUnfocusedState;
    private focusPrevious;
    private focusNext;
    private updateMnemonicVisibility;
    private mnemonicsInUse;
    private onMenuTriggered;
    private onModifierKeyToggled;
    private isCurrentMenu;
    private cleanupMenu;
    private showMenu;
}
export declare function escape(html: string): string;
