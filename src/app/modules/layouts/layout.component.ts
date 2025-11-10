import { Component, OnInit } from '@angular/core';

import {
  LAYOUT_VERTICAL, LAYOUT_HORIZONTAL, LAYOUT_TWOCOLUMN, LAYOUT_MODE, LAYOUT_WIDTH,
  LAYOUT_POSITION, SIDEBAR_SIZE, SIDEBAR_COLOR, TOPBAR
} from '../../core/models/layout/layout.model';
import { EventService } from 'src/app/core/services/layout/event.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})

/**
 * Layout Component
 */
export class LayoutComponent implements OnInit {

  layoutType!: string;
  isCondensed: any = false;

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.layoutType = LAYOUT_VERTICAL;

     // listen to event and change the layout, theme, etc
     this.eventService.subscribe('changeLayout', (layout: string) => {
      this.layoutType = layout;
    });
    
    document.documentElement.setAttribute('data-layout', 'vertical');
    document.documentElement.setAttribute('data-topbar', 'dark');
    document.documentElement.setAttribute('data-sidebar', 'dark');
    document.documentElement.setAttribute('data-layout-style', 'default');
    document.documentElement.setAttribute('data-layout-mode', 'light');
    document.documentElement.setAttribute('data-layout-width', 'fluid');
    document.documentElement.setAttribute('data-layout-position', 'fixed');

    window.addEventListener('resize' , function(){
      if (window.screen.width <= 767) {
        document.documentElement.setAttribute('data-sidebar-size', '');
      }
      else if (window.screen.width <= 1024) {
        document.documentElement.setAttribute('data-sidebar-size', 'sm');
      }
      else if (window.screen.width >= 1024) {      
        document.documentElement.setAttribute('data-sidebar-size', 'lg');
      }
    })
  }

  /**
  * Check if the vertical layout is requested
  */
   isVerticalLayoutRequested() {
    return this.layoutType === LAYOUT_VERTICAL;
  }

  /**
   * Check if the horizontal layout is requested
   */
   isHorizontalLayoutRequested() {
    return this.layoutType === LAYOUT_HORIZONTAL;
  }

  /**
   * Check if the horizontal layout is requested
   */
   isTwoColumnLayoutRequested() {
    return this.layoutType === LAYOUT_TWOCOLUMN;
  }

  onToggleMobileMenu() {
    const currentSIdebarSize = document.documentElement.getAttribute("data-sidebar-size");
    if (window.screen.width >= 767) {
      if (currentSIdebarSize == null) {
        (document.documentElement.getAttribute('data-sidebar-size') == null || document.documentElement.getAttribute('data-sidebar-size') == "lg") ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'lg')
      } else if (currentSIdebarSize == "md") {
        (document.documentElement.getAttribute('data-sidebar-size') == "md") ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'md')
      } else {
        (document.documentElement.getAttribute('data-sidebar-size') == "sm") ? document.documentElement.setAttribute('data-sidebar-size', 'lg') : document.documentElement.setAttribute('data-sidebar-size', 'sm')
      }
    }
    
  if (window.screen.width <= 767) {
    document.body.classList.toggle('vertical-sidebar-enable');
  }
  this.isCondensed = !this.isCondensed;
  }

  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
    const rightBar = document.getElementById('theme-settings-offcanvas');
    if(rightBar != null){
      rightBar.classList.toggle('show');
      rightBar.setAttribute('style',"visibility: visible;");

    }
  }
}