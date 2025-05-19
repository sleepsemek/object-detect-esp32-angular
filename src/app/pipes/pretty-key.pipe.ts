import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyKey'
})
export class PrettyKeyPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const withSpaces = value.replace(/_/g, ' ');

    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }
}
