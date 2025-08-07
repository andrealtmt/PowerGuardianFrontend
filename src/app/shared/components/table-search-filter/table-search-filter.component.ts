import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface FilterOption {
  label: string;
  value: string | number | null;
  count?: number;
}

export interface SearchFilterConfig {
  searchPlaceholder?: string;
  showItemCount?: boolean;
  filters?: {
    label: string;
    key: string;
    options: FilterOption[];
  }[];
}

export interface SearchFilterResult {
  searchTerm: string;
  filters: { [key: string]: any };
}

@Component({
  selector: 'app-table-search-filter',
  templateUrl: './table-search-filter.component.html',
  styleUrls: ['./table-search-filter.component.scss']
})
export class TableSearchFilterComponent implements OnInit {
  @Input() config: SearchFilterConfig = {
    searchPlaceholder: 'Buscar...',
    showItemCount: true,
    filters: []
  };

  @Input() totalItems: number = 0;
  @Input() filteredItems: number = 0;
  @Input() loading: boolean = false;

  @Output() searchChange = new EventEmitter<SearchFilterResult>();
  @Output() clearFilters = new EventEmitter<void>();

  searchTerm: string = '';
  activeFilters: { [key: string]: any } = {};
  showAdvancedFilters: boolean = false;

  ngOnInit() {
    this.initializeFilters();
  }

  private initializeFilters() {
    if (this.config.filters) {
      this.config.filters.forEach(filter => {
        this.activeFilters[filter.key] = null;
      });
    }
  }

  onSearchChange() {
    this.emitSearchChange();
  }

  onFilterChange(filterKey: string, value: any) {
    this.activeFilters[filterKey] = value;
    this.emitSearchChange();
  }

  private emitSearchChange() {
    const result: SearchFilterResult = {
      searchTerm: this.searchTerm.trim(),
      filters: { ...this.activeFilters }
    };
    this.searchChange.emit(result);
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.initializeFilters();
    this.clearFilters.emit();
    this.emitSearchChange();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.length > 0 ||
           Object.values(this.activeFilters).some(value => value !== null && value !== '');
  }

  getActiveFiltersCount(): number {
    return Object.values(this.activeFilters).filter(value => value !== null && value !== '').length;
  }

  getFilterOptionLabel(filter: any, value: any): string {
    const option = filter.options.find((opt: FilterOption) => opt.value === value);
    return option ? option.label : value;
  }
}
