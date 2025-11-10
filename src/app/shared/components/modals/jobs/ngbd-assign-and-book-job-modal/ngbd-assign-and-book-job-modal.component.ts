import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsersHttpRequestsService } from 'src/app/core/services/http-requests/users-http-requests.service';

@Component({
  selector: 'app-ngbd-assign-and-book-job-modal',
  templateUrl: './ngbd-assign-and-book-job-modal.component.html',
  styleUrls: ['./ngbd-assign-and-book-job-modal.component.scss']
})
export class NgbdAssignAndBookJobModalComponent implements OnInit {
  @Input() type: string = 'assignAndBook';
  @Input() users: any[] = [];
  @Input() selectedJobIds: any[] = [];
  
  @Output() onSubmit = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  selectedUserId: number[] = [];
  bookedDate: string = '';
  isLoading: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private usersHttpRequestsService: UsersHttpRequestsService
  ) { }

  ngOnInit(): void {
    console.log(this.selectedJobIds);
  }

  checkUncheckData(event: any, user: any): void {
    if (event.target.checked) {
      // For single selection, clear previous selection
      this.selectedUserId = [user.id];
    } else {
      this.selectedUserId = this.selectedUserId.filter(id => id !== user.id);
    }
    
    console.log('Selected user ID:', this.selectedUserId);
  }

  async submit(): Promise<void> {
    if (!this.validateForm()) return;

    this.isLoading = true;
    const selectedUser = this.getSelectedUser();
    
    try {
      console.log('Selected user:', selectedUser);
      console.log('Job IDs:', this.selectedJobIds);

      // Assign jobs
      const assignResponse = await this.usersHttpRequestsService
        .assignJobsToUser(selectedUser.userName, this.selectedJobIds)
        .toPromise();

      // Book jobs if date is provided
      if (this.bookedDate) {
        const bookPayload = {
          jobs: this.selectedJobIds,
          bookedDate: this.bookedDate
        };
        
        const bookResponse = await this.usersHttpRequestsService
          .bookBatchJobToUser(bookPayload)
          .toPromise();
          
        this.handleSuccess(bookResponse);
      } else {
        this.handleSuccess(assignResponse);
      }

    } catch (error) {
      this.handleError('Failed to process jobs', error);
    }
  }

  private handleSuccess(response: any): void {
    this.isLoading = false;
    this.close(response);
  }

  private handleError(message: string, error: any): void {
    this.isLoading = false;
    console.error(`${message}:`, error);
    alert(`${message}. Please try again.`);
  }

  private validateForm(): boolean {
    // For types that require user selection
    if (this.selectedUserId.length === 0) {
      alert('Please select a user.');
      return false;
    }

    return true;
  }

  close(response: any): void {
    this.activeModal.close(response);
  }

  // Helper method to get selected user info
  getSelectedUser(): any {
    if (this.selectedUserId.length > 0) {
      return this.users.find(user => user.id === this.selectedUserId[0]);
    }
    return null;
  }

  // Reset form when modal opens
  resetForm(): void {
    this.selectedUserId = [];
    this.bookedDate = '';
    this.isLoading = false;
  }
}
