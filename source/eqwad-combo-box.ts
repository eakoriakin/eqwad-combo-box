import {Component, Input, Output, ViewChild, Renderer, OnDestroy, EventEmitter} from 'angular2/core';

@Component({
    selector: 'eq-combo-box',
    template: `
        <div class="eq-combo-box" #comboBoxElement
            [ngClass]="{ 'eq-combo-box_is-opened': _isOpened, 'eq-combo-box_is-focused': _isFocused }"
            (mouseenter)="_mouseenter()"
            (mouseleave)="_mouseleave()"
        >
            <div class="eq-combo-box__wrapper">
                <input class="eq-combo-box__text" #textElement
                    type="text"
                    autocomplete="off"
                    [placeholder]="placeholder"
                    readonly
                />
                <div class="eq-combo-box__open" (click)="_open()">
                    <i class="fa fa-caret-down"></i>
                </div>
            </div>
        </div>
        <div class="eq-combo-box-list" #listElement
            [ngClass]="{ 'eq-combo-box-list_is-opened': _isOpened, 'eq-combo-box-list_is-focused': _isFocused }"
            (mouseenter)="_mouseenter()"
            (mouseleave)="_mouseleave()"
        >
            <div class="eq-combo-box-list__item"
                *ngFor="let item of items"
                (click)="_select(item, $event)"
            >{{item[itemTextField]}}
            </div>
        </div>
    `
})

export class EqwadComboBoxComponent implements OnDestroy {
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

    private _isOpened = false;
    private _isFocused = false;
    private _isHovered = false;
    private _documentClickListener: Function;

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
        this._setListWidth();
        this._isOpened = true;
    }

    close() {
        this._isOpened = false;
    }

    private _open() {
        this._isOpened = !this._isOpened;

        if (this._isOpened) {
            this._setListWidth();
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

        this._isOpened = false;
        this.onClose.emit(null);
    }

    private _mouseenter() {
        this._isHovered = true;
    }

    private _mouseleave() {
        this._isHovered = false;
    }

    private _select(item: Object, event: any) {
        for (let i = 0; i < this.listElement.nativeElement.children.length; i++) {
            this.listElement.nativeElement.children[i].className = 'eq-combo-box-list__item';
        }

        event.target.className = event.target.className + ' eq-combo-box-list__item_is-selected';
        this.value = [item];
        this.textElement.nativeElement.value = item[this.itemTextField];
        this.onSelect.emit(item);
        this._close();
    }

    private _setListWidth() {
        // Set list width equal to ComboBox width.
        this.listElement.nativeElement.style.width = this.comboBoxElement.nativeElement.offsetWidth + 'px';
    }
}
