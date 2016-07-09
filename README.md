[npm-image]: https://img.shields.io/npm/v/eqwad-combo-box.svg
[npm-url]: https://npmjs.org/package/eqwad-combo-box
[downloads-image]: https://img.shields.io/npm/dm/eqwad-combo-box.svg

# Eqwad ComboBox

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]

## Overview

Eqwad ComboBox is a customizable select box for Angular2.

## Table of contents
* [Examples ](#examples)
* [Dependencies](#dependencies)
* [Download](#download)
* [Getting started](#getting-started)
* [Properties](#properties)
* [Methods](#methods)
* [Events](#events)

## Examples
Examples are [here](https://eqwad-combo-box-demo.herokuapp.com/).

## Dependencies
* [Angular2](https://angular.io/) (2.0.0-beta.17 or higher).
* [Font Awesome](http://fontawesome.io/) (4.5.0 or higher).

## Download
Download it using npm:

`npm install eqwad-combo-box`

## Getting started
Follow the steps below to add Eqwad ComboBox to your app. Also check out [Eqwad ComboBox Demo](https://github.com/eakoryakin/eqwad-combo-box-demo) for an example of installation.

Include Eqwad ComboBox CSS file in your main app HTML file and configure SystemJS.  

    <!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" href="node_modules/font-awesome/css/font-awesome.min.css">
            <link rel="stylesheet" href="node_modules/eqwad-combo-box/eqwad-combo-box.css">
            <script src="node_modules/systemjs/dist/system.src.js"></script>
            <script src="node_modules/angular2/bundles/angular2-polyfills.js"></script>
            <script src="node_modules/angular2/bundles/angular2.js"></script>
            <script>
                System.config({
                    packages: {
                        app: {
                            format: 'register',
                            defaultExtension: 'js'
                        },
                        'eqwad-combo-box': {}
                    },
                    map: {
                        'eqwad-combo-box': 'node_modules/eqwad-combo-box/eqwad-combo-box.js'
                    }
                });

                System.import ('app/app').then(null, console.error.bind(console));
            </script>
        </head>
    </html>

Import it to your app component.

    import { Component, ViewChild } from 'angular2/core';
    import { EqwadComboBox } from 'eqwad-combo-box';

    @Component({
        selector: 'app',
        templateUrl: 'app.component.html',
        directives: [
            EqwadComboBox
        ]
    })
    export class AppComponent {
        fabrics = [
            { name: 'Cotton', id: '1' },
            { name: 'Polyester', id: '2' },
            { name: 'Cotton/Polyester', id: '3' },
            { name: 'Rib Knit', id: '4' }
        ];

        @ViewChild('fabricsComboBox') fabricsComboBox: EqwadComboBox;

        constructor() {
            select(item: Object) {
                // Handle the event.
            }
        }
    }

Declare it in the component's HTML file.

    <eq-combo-box #fabricsComboBox
        [items]=fabrics
        [itemValueField]="'id'"
        [itemTextField]="'name'"
        [placeholder]="'Select fabric...'"
        (onSelect)="select($event)">
    </eq-combo-box>

## Properties
### [items](../../wiki/items)
The data source of the component which is used to display a list of values.

### [itemTextField](../../wiki/itemTextField)
The field of the data item that provides the text content of the list items. The component will filter the data based on this field.

### [itemValueField](../../wiki/itemValueField)
The field of the data item that provides the value of the component.

### [placeholder](../../wiki/placeholder)
The hint displayed by the component when the value is not selected.

## Methods
### [close()](../../wiki/close())
Closes the list.

### [open()](../../wiki/open())
Opens the list.

## Events
### [onClose](../../wiki/onClose)
Fires when the list is closed by the user.

### [onOpen](../../wiki/onOpen)
Fires when the list is opened by the user.

### [onSelect](../../wiki/onSelect)
Fires when an item from the list is selected by the user.
