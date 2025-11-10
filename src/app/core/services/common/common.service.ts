import { Injectable } from '@angular/core';
import { OptionModel } from '../../models/survey/survey-section-questions.model';

  
  @Injectable({
    providedIn: 'root'
  })
  export class CommonService {
    getDates() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
  
    const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
    const firstDay = new Date(yyyy, today.getMonth(), 1);
    const lastDay = new Date(yyyy, today.getMonth() + 1, 0);
  
    const endDateLastMonth = formatDate(today.getMonth() === 0 ? new Date(yyyy - 1, 12, 0) : new Date(yyyy, today.getMonth(), 0));
  
    return {
      dateToday: formatDate(today),
      endDateLastMonth,
      firstDateCurrentMonth: formatDate(firstDay),
      lastDateCurrentMonth: formatDate(lastDay),
    };
  }

  formatDateTime() {
    const now = new Date();
    let dateTimeformat: any = '';
    dateTimeformat = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()) + "T" + String(String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0'));
    // console.log(dateTimeformat);
    return dateTimeformat
  }

  removeBase64Prefix(base64String: string): string {
    if (!base64String) {
      return '';
    }
    
    // Check if string contains the data URL prefix
    const base64Index = base64String.indexOf('base64,');
    
    if (base64Index !== -1) {
      // Return everything after "base64,"
      return base64String.substring(base64Index + 7);
    }
    
    // If no prefix found, return the original string
    return base64String;
  }

  fixOptionDisplayOrder(options: OptionModel[]) {
    if(options.length != 0) {
        for(let x = 0 ; x < options.length; x++) {
            options[x].displayOrder = x;
        }
    }
    return options;
  }

  getOptionDisplayOrder(options: OptionModel[]) {
    let highestNumber = 0;
    if(options.length === 0) {
      return 0;
    } else {
      for(let x = 0 ; x < options.length; x++) {
        if(options[x].displayOrder > highestNumber) {
          highestNumber = options[x].displayOrder;
        }
      }
      return highestNumber + 1;
    }
  }
}