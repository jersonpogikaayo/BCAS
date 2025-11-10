import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ColumnHeaderModel } from 'src/app/core/models/common-datagrid/common-data-grid.model';
import { Site } from 'src/app/core/models/site/site.model';
import { SiteHttpRequestsService } from 'src/app/core/services/http-requests/site-http.requests.service';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss']
})
export class SitesComponent implements OnInit {
  siteGridItems: any[] = [];
  siteTotalItems: number = 0;
  siteCurrentPage: number = 1;
  sitePageSize: number = 10;
  siteLoading: boolean = false;
  siteGridParameter = {};
  siteColumnHeader: ColumnHeaderModel[] = [
      { prettyName: 'ID', technicalName: 'id', visible: true },
      { prettyName: 'Name', technicalName: 'name', visible: true },
      { prettyName: 'Email', technicalName: 'email', visible: true },
      { prettyName: 'Phone', technicalName: 'phone', visible: true },
      { prettyName: 'Post Code', technicalName: 'postCode', visible: true },
  ];
  selectedSites: Site[] = [];
  saveSitesLoading: boolean = false;
  constructor(
    private sitesHttpRequest: SiteHttpRequestsService
  ) { }

  ngOnInit(): void {
  }

  loadSiteData(params: any, forceRefresh: boolean = true) {
    this.siteLoading = true;

    const paginationParams = {
      ...params,
      PageNumber: this.siteCurrentPage - 1,
      PageSize: this.sitePageSize
    };

    const countParams = { ...params };
    delete countParams.PageNumber;
    delete countParams.PageSize;

    const data$ = this.sitesHttpRequest.getGridData(paginationParams, forceRefresh);
    const count$ = this.sitesHttpRequest.getGridDataCount(countParams, forceRefresh);

    // Use forkJoin to execute both requests simultaneously
    forkJoin({
      data: data$,
      count: count$
    }).subscribe({
      next: (response) => {
        this.siteGridItems = response.data.items || response.data;
        this.siteTotalItems = response.count;
        this.siteLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading grid data:', error);
        this.siteLoading = false;
      }
    });
  }

onPageSiteSizeChanged(size: number) {
  this.sitePageSize = size;
  this.siteCurrentPage = 1;
  this.loadSiteData(this.siteGridParameter, false);
}

onSiteSearch(searchData: any): void {
  this.siteCurrentPage = 1;
  const searchParams = {
    ...this.siteGridParameter,
    ...searchData
  };
  this.loadSiteData(searchParams, true);
}

onSitePageChanged(event: any): void {
  this.siteCurrentPage = event.page;
  this.sitePageSize = event.pageSize;
  this.loadSiteData(this.siteGridParameter, false);
}

onSelectionChangedSites(selectedItems: any[]): void {
    this.selectedSites = selectedItems;
  }

  removeSite(sites: Site[]) {
    const siteIdsToRemove = new Set(sites.map(site => site.id));
    // Filter out the sites to be removed
    const originalCount = this.selectedSites.length;
    this.selectedSites = this.selectedSites.filter(s => !siteIdsToRemove.has(s.id));
    const removedCount = originalCount - this.selectedSites.length;
  }

  onEditSite(site: Site): void {
    // const modalRef = this.modalService.open(NgbdAddEditSitesModalComponent, { 
    //   size: 'fullscreen', 
    //   backdrop: 'static', 
    //   keyboard: false 
    // });
    // modalRef.componentInstance.contact = this.contact;
    // modalRef.componentInstance.site = site;
    // modalRef.componentInstance.customer = this.customer;

    // modalRef.result.then((updatedSite: Site) => {
    //   this.loadSiteData(this.siteGridParameter, true);
    // });
  }
}
