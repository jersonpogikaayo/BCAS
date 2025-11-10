import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'columnFormat'})
export class ColumnFormatPipe implements PipeTransform {
  transform(value: any, columnType: string): any {
    if (!value && value !== 0) return '-';
    
    switch(columnType) {
      case 'dueDate':
      case 'bookedDate':
      case 'completionDate':
      case 'nextDueDate':
        return value ? new Date(value).toLocaleDateString('en-GB') : '-';
      
      case 'status':
        return value ? this.capitalizeFirst(value) : '-';
      
      case 'contactPhone':
      case 'contactMobile':
        return value ? this.formatPhone(value) : '-';
      
      case 'contactEmail':
        return value ? value.toLowerCase() : '-';
      
      default:
        return value || '-';
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  }
}