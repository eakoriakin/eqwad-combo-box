import { Pipe, PipeTransform } from 'angular2/core';

@Pipe({
    name: 'eqwadComboBoxFilter'
})
export class EqwadComboBoxFilter implements PipeTransform {
    transform(items: Array<Object>, itemTextField: string, text: string, value: Object, isTyping: boolean) {
        if (value && !isTyping) {
            return items;
        }

        return items.filter(item => {
            let itemText = item[itemTextField];
            return itemText && itemText.toLowerCase().indexOf(text.toLowerCase()) !== -1;
        });
    }
}
