import { EventLike } from "../common/dom";
import { MenuItemConstructorOptions } from "electron";
import { IMenuStyle, IMenuOptions } from "./menu";
import { KeyCode } from "../common/keyCodes";
import { Disposable } from "../common/lifecycle";
export interface IMenuItem extends MenuItemConstructorOptions {
    render(element: HTMLElement): void;
    isEnabled(): boolean;
    focus(): void;
    blur(): void;
    dispose(): void;
}
export declare class MenuItem extends Disposable implements IMenuItem {
    protected options: IMenuOptions;
    protected menuStyle: IMenuStyle;
    protected container: HTMLElement;
    protected itemElement: HTMLElement;
    private item;
    private labelElement;
    private checkElement;
    private mnemonic;
    private event;
    private currentWindow;
    constructor(item: IMenuItem, options?: IMenuOptions);
    getContainer(): HTMLElement;
    getItem(): IMenuItem;
    isEnabled(): boolean;
    render(container: HTMLElement): void;
    onClick(event: EventLike): void;
    focus(): void;
    blur(): void;
    updateLabel(): void;
    updateTooltip(): void;
    updateEnabled(): void;
    updateChecked(): void;
    dispose(): void;
    getMnemonic(): KeyCode;
    protected applyStyle(): void;
    style(style: IMenuStyle): void;
}
