import { Component, OnInit } from '@angular/core';
import { ActivityLog } from '../../models/activity-log.model';
import { ActivityLogService } from '../../services/activity-log.service';

@Component({
  selector: 'app-activity-log',
  standalone: false,
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.css'
})
export class ActivityLogComponent implements OnInit {

  logs: ActivityLog[] = [];
  filteredLogs: ActivityLog[] = [];
  paginatedLogs: ActivityLog[] = [];

  filterText: string = '';
  filterDate: string = '';

  currentPage: number = 1;
  rowsPerPage: number = 10;
  totalPages: number = 0;

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit(): void {
    this.activityLogService.getAll().subscribe({
      next: (data) => {
        this.logs = data;
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    const text = this.filterText.toLowerCase();
    this.filteredLogs = this.logs.filter(log => {
      const matchText = !text ||
        log.username.toLowerCase().includes(text) ||
        log.action.toLowerCase().includes(text) ||
        log.detail.toLowerCase().includes(text);
      const matchDate = !this.filterDate || log.fecha === this.filterDate;
      return matchText && matchDate;
    });
    this.totalPages = Math.max(1, Math.ceil(this.filteredLogs.length / this.rowsPerPage));
    this.currentPage = 1;
    this.updatePage();
  }

  clearFilters(): void {
    this.filterText = '';
    this.filterDate = '';
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePage();
    }
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    this.paginatedLogs = this.filteredLogs.slice(start, start + this.rowsPerPage);
  }

  badgeClass(action: string): string {
    switch (action) {
      case 'LOGIN_SUCCESS':
      case 'INSERT_PRODUCT':
      case 'INSERT_USER':
        return 'bg-success';
      case 'LOGIN_FAILED':
      case 'DELETE_PRODUCT':
      case 'DELETE_USER':
        return 'bg-danger';
      case 'CANCEL_SALE':
        return 'bg-warning text-dark';
      case 'FORBIDDEN_ACTION':
        return 'bg-dark';
      default:
        return 'bg-secondary';
    }
  }
}
