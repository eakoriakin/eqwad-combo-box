import { Component, Input, Output, ViewChild, Renderer, OnDestroy, EventEmitter } from 'angular2/core';
import { EqwadComboBoxFilter } from './eqwad-combo-box-filter.pipe';

@Component({
    selector: 'eq-combo-box',
    pipes: [EqwadComboBoxFilter],
    template: `
        <div class="eq-combo-box" #comboBoxElement
            tabindex="0"
            [ngClass]="{
                'eq-combo-box_is-opened': _isOpened,
                'eq-combo-box_is-focused': _isFocused,
                'eq-combo-box_has-items': _hasItems
            }"
            (keydown)="_keydown($event)"
            (mouseenter)="_mouseenter()"
            (mouseleave)="_mouseleave()">
            <div class="eq-combo-box__wrapper">
                <input class="eq-combo-box__text" #textElement
                    type="text"
                    autocomplete="off"
                    [ngModel]="_text"
                    (ngModelChange)="_textChange($event)"
                    [placeholder]="placeholder"/>
                <div class="eq-combo-box__open"
                    (click)="_open()">
                    <i class="fa fa-caret-down"></i>
                </div>
            </div>
        </div>
        <div class="eq-combo-box-list" #listElement
            [ngClass]="{
                'eq-combo-box-list_is-opened': _isOpened,
                'eq-combo-box-list_is-focused': _isFocused,
                'eq-combo-box-list_has-items': _hasItems
            }"
            (mouseenter)="_mouseenter()"
            (mouseleave)="_mouseleave()">
            <div class="eq-combo-box-list__item"
                *ngFor="let item of (items | eqwadComboBoxFilter:itemTextField:_text); let i = index"
                [ngClass]="{
                    'eq-combo-box-list__item_is-selected': _isItemSelected(i),
                    'eq-combo-box-list__item_is-highlighted': _isItemHighlighted(i)
                }"
                (click)="_select(i, $event)">
                {{item[itemTextField]}}
            </div>
        </div>
    `
})

export class EqwadComboBox implements OnDestroy {
    @Input() itemValueField: string;
    @Input() itemTextField: string;
    @Input() items: Array<Object> = [];
    @Input() placeholder: string = '';

    @Output() onSelect: EventEmitter<any> = new EventEmitter();
    @Output() onOpen: EventEmitter<any> = new EventEmitter();
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild('comboBoxElement') private comboBoxElement: any;
    @ViewChild('listElement') private listElement: any;
    @ViewChild('textElement') private textElement: any;

    value: Array<Object> = [];

    private _text = '';
    private _isOpened = false;
    private _isFocused = false;
    private _isHovered = false;
    private _documentClickListener: Function;
    private _hasItems: boolean;
    private _keyCode = {
        down: 40,
        escape: 27,
        tab: 9,
        up: 38
    };
    private _highlightedItemIndex = -1;
    private _selectedItemIndex = -1;

    constructor(renderer: Renderer) {
        this._documentClickListener = renderer.listenGlobal('document', 'click', (event: any) => {
            // Close list if user clicks outside.
            if (!this._isHovered && this._isOpened) {
                this._close();
            }

            if (!this._isHovered && this._isFocused) {
                this._isFocused = false;
            }
        });
    }

    ngOnDestroy() {
        // Remove listeners.
        this._documentClickListener();
    }

    open() {
        this._checkItems();
        this._positionList();
        this._isOpened = true;
    }

    close() {
        this._isOpened = false;
    }

    private _open() {
        this._checkItems();
        this._isOpened = !this._isOpened;

        if (this._isOpened) {
            this._positionList();
            this._isFocused = true;
            this.onOpen.emit(null);
        } else {
            this.onClose.emit(null);
        }
    }

    private _close() {
        if (!this._isOpened) {
            return;
        }

        this._highlightedItemIndex = -1;
        this._isOpened = false;
        this.onClose.emit(null);
    }

    private _mouseenter() {
        this._isHovered = true;
    }

    private _mouseleave() {
        this._isHovered = false;
    }

    private _select(itemIndex: number, event: any) {
        let item = this.items[itemIndex];
        this._selectedItemIndex = itemIndex;
        this.value = [item];
        this.textElement.nativeElement.value = item[this.itemTextField];
        this.onSelect.emit(item);
        this._close();
    }

    private _positionList() {
        this.listElement.nativeElement.style.width = this.comboBoxElement.nativeElement.offsetWidth + 'px';
        this.listElement.nativeElement.style.left = this.comboBoxElement.nativeElement.offsetLeft + 'px';
    }

    private _textChange(text: string) {
        this._text = text;
        this._checkItems();

        if (!this._isOpened) {
            this.open();
        }
    }

    private _checkItems() {
        this._hasItems = new EqwadComboBoxFilter().transform(this.items, this.itemTextField, this._text).length > 0;
    }

    private _isItemSelected(itemIndex) {
        return itemIndex === this._selectedItemIndex;
    }

    private _isItemHighlighted(itemIndex) {
        return itemIndex === this._highlightedItemIndex;
    }

    private _keydown(event) {
        // Down key.
        if (event.which === this._keyCode.down) {
            if (!this._isOpened) {
                this.open();
                return;
            }

            if (this._highlightedItemIndex === -1) {
                this._highlightedItemIndex = 0;
            } else {
                if (this._highlightedItemIndex < this.items.length - 1) {
                    this._highlightedItemIndex++;
                }
            }
        }

        // Up key.
        if (event.which === this._keyCode.up) {
            if (!this._isOpened) {
                return;
            }

            if (this._highlightedItemIndex > 0) {
                this._highlightedItemIndex--;
            }
        }

        // Tab key.
        if (event.which === this._keyCode.tab) {
            if (this._highlightedItemIndex === -1) {
                return;
            }

            this._select(this._highlightedItemIndex);
        }

        // Esc key.
        if (event.which === this._keyCode.escape) {
            if (this._isOpened) {
                this._close();
            }
        }
    }
}
