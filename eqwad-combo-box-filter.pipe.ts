import { Pipe, PipeTransform } from 'angular2/core';

@Pipe({
    name: 'eqwadComboBoxFilter'
})
export class EqwadComboBoxFilter implements PipeTransform {
    transform(items: Array<Object>, itemTextField: string, value: string) {
        return items.filter(item => {
            let itemText = item[itemTextField];
            return itemText && itemText.toLowerCase().indexOf(value.toLowerCase()) !== -1;
        });
    }
}
