/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 * 
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 * 
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/

import { EventType, addDisposableListener, addClass, removeClass, removeNode, append, $, hasClass, EventHelper, EventLike } from "../common/dom";
import { MenuItemConstructorOptions, BrowserWindow, remote } from "electron";
import { IMenuStyle, MENU_MNEMONIC_REGEX, cleanMnemonic, MENU_ESCAPED_MNEMONIC_REGEX, IMenuOptions } from "./menu";
import { KeyCode, KeyCodeUtils } from "../common/keyCodes";
import { Disposable } from "../common/lifecycle";
import { setImmediate } from '../common/platform';

export interface IMenuItem extends MenuItemConstructorOptions {
	render(element: HTMLElement): void;
	isEnabled(): boolean;
	focus(): void;
	blur(): void;
	dispose(): void;
}

export class MenuItem extends Disposable implements IMenuItem {

	protected options: IMenuOptions;
	protected menuStyle: IMenuStyle;
	protected container: HTMLElement;
	protected itemElement: HTMLElement;

	private item: IMenuItem;
	private labelElement: HTMLElement;
	private checkElement: HTMLElement;
	private mnemonic: KeyCode;

	private event: Electron.Event;
	private currentWindow: BrowserWindow;

	constructor(item: IMenuItem, options: IMenuOptions = {}) {
		super();

		this.item = item;
		this.options = options;
		this.currentWindow = remote.getCurrentWindow();

		// Set mnemonic
		if (this.item.label && options.enableMnemonics) {
			let label = this.item.label;
			if (label) {
				let matches = MENU_MNEMONIC_REGEX.exec(label);
				if (matches) {
					this.mnemonic = KeyCodeUtils.fromString((!!matches[1] ? matches[1] : matches[2]).toLocaleUpperCase());
				}
			}
		}
	}

	getContainer() {
		return this.container;
	}

	getItem(): IMenuItem {
		return this.item;
	}

	isEnabled(): boolean {
		return this.item.enabled;
	}

	render(container: HTMLElement): void {
		this.container = container;

		this._register(addDisposableListener(this.container, EventType.MOUSE_DOWN, e => {
			if (this.item.enabled && e.button === 0 && this.container) {
				addClass(this.container, 'active');
			}
		}));

		this._register(addDisposableListener(this.container, EventType.CLICK, e => {
			EventHelper.stop(e, true);
			this.onClick(e);
		}));

		this._register(addDisposableListener(this.container, EventType.DBLCLICK, e => {
			EventHelper.stop(e, true);
		}));

		[EventType.MOUSE_UP, EventType.MOUSE_OUT].forEach(event => {
			this._register(addDisposableListener(this.container!, event, e => {
				EventHelper.stop(e);
				removeClass(this.container!, 'active');
			}));
		});

		this.itemElement = append(this.container, $('a.action-menu-item'));
		this.itemElement.setAttribute('role', 'menuitem');

		if (this.mnemonic) {
			this.itemElement.setAttribute('aria-keyshortcuts', `${this.mnemonic}`);
		}

		this.checkElement = append(this.itemElement, $('span.menu-item-check'));
		this.checkElement.setAttribute('role', 'none');

		this.labelElement = append(this.itemElement, $('span.action-label'));

		if (this.item.label && this.item.accelerator) {
			append(this.itemElement, $('span.keybinding')).textContent = this.item.accelerator.toString();
		}

		this.updateLabel();
		this.updateTooltip();
		this.updateEnabled();
		this.updateChecked();
	}

	onClick(event: EventLike) {
		EventHelper.stop(event, true);

		if (this.item.click) {
			this.item.click(this.item as Electron.MenuItem, this.currentWindow, this.event);
		}

		if (this.item.type === 'checkbox') {
			this.item.checked = !this.item.checked;
			this.updateChecked();
		}
	}

	focus(): void {
		if (this.container) {
			this.container.focus();
			addClass(this.container, 'focused');
		}

		this.applyStyle();
	}

	blur(): void {
		if (this.container) {
			this.container.blur();
			removeClass(this.container, 'focused');
		}

		this.applyStyle();
	}

	updateLabel(): void {
		if (this.item.label) {
			let label = this.item.label;
			if (label) {
				const cleanLabel = cleanMnemonic(label);
				if (!this.options.enableMnemonics) {
					label = cleanLabel;
				}

				this.labelElement.setAttribute('aria-label', cleanLabel);

				const matches = MENU_MNEMONIC_REGEX.exec(label);

				if (matches) {
					label = escape(label).replace(MENU_ESCAPED_MNEMONIC_REGEX, '<u aria-hidden="true">$1</u>');
					this.itemElement.setAttribute('aria-keyshortcuts', (!!matches[1] ? matches[1] : matches[2]).toLocaleLowerCase());
				}
			}

			this.labelElement.innerHTML = label.trim();
		}
	}

	updateTooltip(): void {
		let title: string | null = null;

		if (this.item.sublabel) {
			title = this.item.sublabel;
		} else if (!this.item.label && this.item.label && this.item.icon) {
			title = this.item.label;

			if (this.item.accelerator) {
				title = this.item.accelerator.toString();
			}
		}

		if (title) {
			this.itemElement.title = title;
		}
	}

	updateEnabled() {
		if (this.item.enabled && this.item.type !== 'separator') {
			removeClass(this.container, 'disabled');
			this.container.tabIndex = 0;
		} else {
			addClass(this.container, 'disabled');
		}
	}

	updateChecked() {
		if (this.item.checked) {
			addClass(this.itemElement, 'checked');
			this.itemElement.setAttribute('role', 'menuitemcheckbox');
			this.itemElement.setAttribute('aria-checked', 'true');
		} else {
			removeClass(this.itemElement, 'checked');
			this.itemElement.setAttribute('role', 'menuitem');
			this.itemElement.setAttribute('aria-checked', 'false');
		}
	}

	dispose(): void {
		if (this.itemElement) {
			removeNode(this.itemElement);
			this.itemElement = undefined;
		}

		super.dispose();
	}

	getMnemonic(): KeyCode {
		return this.mnemonic;
	}

	protected applyStyle() {
		if (!this.menuStyle) {
			return;
		}

		const isSelected = this.container && hasClass(this.container, 'focused');
		const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
		const bgColor = isSelected && this.menuStyle.selectionBackgroundColor ? this.menuStyle.selectionBackgroundColor : this.menuStyle.backgroundColor;

		this.checkElement.style.backgroundColor = fgColor ? fgColor.toString() : null;
		this.itemElement.style.color = fgColor ? fgColor.toString() : null;
		this.itemElement.style.backgroundColor = bgColor ? bgColor.toString() : null;
	}

	style(style: IMenuStyle): void {
		this.menuStyle = style;
		this.applyStyle();
	}
}
