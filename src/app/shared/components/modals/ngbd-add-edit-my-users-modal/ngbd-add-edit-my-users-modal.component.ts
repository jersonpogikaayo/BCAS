import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'src/app/core/models/user/user.model';
import { LoadingService } from 'src/app/core/services/common/loading.service';
import { MyUsersHttpRequestsService } from 'src/app/core/services/http-requests/my-users-http-requests.service';

@Component({
  selector: 'app-ngbd-add-edit-my-users-modal',
  templateUrl: './ngbd-add-edit-my-users-modal.component.html',
  styleUrls: ['./ngbd-add-edit-my-users-modal.component.scss']
})
export class NgbdAddEditMyUsersModalComponent implements OnInit {
  @Input() user!: User;
  @Input() isEditMode: boolean = false;
  @Input() userRole: string = 'Manager';

  usersForm!: FormGroup;
  submitted: boolean = false;
  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private httpRequests: MyUsersHttpRequestsService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  close() {
    this.activeModal?.close(true);
  }

  private initForm(): void {
    this.usersForm = this.fb.group({
        id: [this.user?.id || null],
        firstName: [this.user?.firstName || '', Validators.required],
        lastName: [this.user?.lastName || '', Validators.required],
        email: [this.user?.email || '', [Validators.required, Validators.email]],
        phoneNumber: [this.user?.phoneNumber || '', Validators.required],
        password: [''],
    });
  }

  updateUser() {
    this.loadingService.show(this.isEditMode ? 'Updating user...' : 'Adding user...');
    this.submitted = true;
    if (this.usersForm.valid) {
      this.user = this.usersForm.value;
      const formValue = this.usersForm.value;

      const userData: User = this.user?.id
        ? (({ password, ...rest }) => rest)(formValue)
        : (({ id, ...rest }) => rest)(formValue);
  
      let operation;
      if( this.userRole === 'Manager') {
        operation = this.isEditMode ?
          this.httpRequests.updateEngineer(userData) :
          this.httpRequests.addEngineer(userData);
      } else {
        operation = this.isEditMode ?
          this.httpRequests.updateManager(userData) :
          this.httpRequests.addManager(userData);
      }

      operation.subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.close();
        },
        error: (error) => {
          this.loadingService.hide();
        }
      });
    } else {
      return
    }
  }

}
