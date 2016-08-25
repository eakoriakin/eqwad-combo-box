import { Component, Input, Output, ViewChild, Renderer, OnDestroy, EventEmitter, OnChanges, SimpleChanges } from 'angular2/core';
import { EqwadComboBoxFilter } from './eqwad-combo-box-filter.pipe';

@Component({
    selector: 'eq-combo-box',
    pipes: [EqwadComboBoxFilter],
    template: `
        <div class="eq-combo-box" #comboBoxElement
            tabindex="{{isEnabled ? '0' : '-1'}}"
            [ngClass]="{
                'eq-combo-box_is-opened': _isOpened,
                'eq-combo-box_is-focused': _isFocused && isEnabled,
                'eq-combo-box_is-enabled': isEnabled,
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
                    (focus)="_textFocus()"
                    (blur)="_textBlur()"
                    [placeholder]="placeholder"
                    [readonly]="!isEnabled"/>
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
                *ngFor="let item of (items | eqwadComboBoxFilter:itemTextField:_text:value:_isTyping); let i = index"
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

export class EqwadComboBox implements OnDestroy, OnChanges {
    @Input() itemValueField: string;
    @Input() itemTextField: string;
    @Input() items: Array<Object> = [];
    @Input() placeholder: string = '';
    @Input() value: Object = null;
    @Input() isEnabled: boolean = true;

    @Output() onSelect: EventEmitter<any> = new EventEmitter();
    @Output() onOpen: EventEmitter<any> = new EventEmitter();
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild('comboBoxElement') private comboBoxElement: any;
    @ViewChild('listElement') private listElement: any;
    @ViewChild('textElement') private textElement: any;

    private _text = '';
    private _isOpened = false;
    private _isFocused = false;
    private _isHovered = false;
    private _isTyping = false;
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
    private _isViewInitialized = false;

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

    ngOnChanges(changes: SimpleChanges) {
        if (changes.value) {
            this._setValue(changes.value.currentValue);
        }
    }

    ngAfterViewInit() {
        this._isViewInitialized = true;
        this._setValue(this.value);
    }

    ngOnDestroy() {
        // Remove listeners.
        this._documentClickListener();
    }

    open() {
        if (!this.isEnabled) {
            return;
        }

        this._checkItems();
        this._positionList();
        this._isOpened = true;
    }

    close() {
        this._isOpened = false;
    }

    private _setValue(value: Object) {
        if (!this._isViewInitialized) {
            return;
        }

        if (value) {
            let selectedItemIndex = -1,
                selectedItem: Object = null;

            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i][this.itemValueField] === value[this.itemValueField]) {
                    selectedItemIndex = i;
                    selectedItem = this.items[i];
                    break;
                }
            }

            this._selectedItemIndex = selectedItemIndex;
            this.textElement.nativeElement.value = selectedItem[this.itemTextField];
        } else {
            this.textElement.nativeElement.value = '';
        }
    }

    private _open() {
        if (!this.isEnabled) {
            return;
        }

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

    private _select(itemIndex: number, event?: any) {
        let item = this.items[itemIndex];
        this._selectedItemIndex = itemIndex;
        this.textElement.nativeElement.value = item[this.itemTextField];

        // No item was previously selected.
        if (!this.value) {
            this.onSelect.emit(item);
        }

        // A different item has been selected.
        if (this.value && this.value[this.itemValueField] !== item[this.itemValueField]) {
            this.onSelect.emit(item);
        }

        this.value = item;
        this._close();
        this._isTyping = false;
    }

    private _positionList() {
        this.listElement.nativeElement.style.width = this.comboBoxElement.nativeElement.offsetWidth + 'px';
        this.listElement.nativeElement.style.left = this.comboBoxElement.nativeElement.offsetLeft + 'px';
    }

    private _textChange(text: string) {
        this._isTyping = true;
        this._text = text;
        this._checkItems();

        if (!this._isOpened) {
            this.open();
        }
    }

    private _textFocus() {
        this._isFocused = true;
    }

    private _textBlur() {
        let text = this.textElement.nativeElement.value;
        this._isTyping = false;
        this._close();

        if (!text) {
            return;
        }

        text = text.toLowerCase();

        // Text has not changed.
        if (this.value && this.value[this.itemTextField].toLowerCase() === text) {
            return;
        }

        let item = {};
        item[this.itemValueField] = '';
        item[this.itemTextField] = this.textElement.nativeElement.value;

        let items = this.items.filter(item => {
            let itemText = item[this.itemTextField];
            return itemText && itemText.toLowerCase() === text;
        });

        if (items.length === 0) {
            // Create a new item if item with the same text does not exist.
            this.value = item;
            this.onSelect.emit(item);
        } else {
            // Use an existing item.
            let existingItem = items[0];

            if (existingItem[this.itemValueField] !== this.value[this.itemValueField]) {
                this.value = existingItem;
                this.onSelect.emit(existingItem);
            }
        }
    }

    private _checkItems() {
        this._hasItems = new EqwadComboBoxFilter()
            .transform(this.items, this.itemTextField, this._text, this.value, this._isTyping)
            .length > 0;
    }

    private _isItemSelected(itemIndex: number) {
        return itemIndex === this._selectedItemIndex;
    }

    private _isItemHighlighted(itemIndex: number) {
        return itemIndex === this._highlightedItemIndex;
    }

    private _keydown(event: any) {
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

            this._select(this._highlightedItemIndex, null);
            this.comboBoxElement.nativeElement.focus();
            this._isFocused = true;
        }

        // Esc key.
        if (event.which === this._keyCode.escape) {
            if (this._isOpened) {
                this._close();
            }
        }
    }
}
