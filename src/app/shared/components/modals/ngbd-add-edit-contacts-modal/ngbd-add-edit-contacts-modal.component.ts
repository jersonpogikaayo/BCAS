import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contact, Customer } from 'src/app/core/models/customer/customer.model';
import { Department } from 'src/app/core/models/department/department-datagrid.model';
import { Site } from 'src/app/core/models/site/site.model';
import { LoadingService } from 'src/app/core/services/common/loading.service';
import { ContactHttpRequestsService } from 'src/app/core/services/http-requests/contact-http-requests.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ngbd-add-edit-contacts-modal',
  templateUrl: './ngbd-add-edit-contacts-modal.component.html',
  styleUrls: ['./ngbd-add-edit-contacts-modal.component.scss']
})
export class NgbdAddEditContactsModalComponent implements OnInit {
  contactForm!: FormGroup;
  @Input() public contact: Contact = {} as Contact;
  @Input() public customer!: Customer;
  @Input() public site!: Site;
  @Input() public department!: Department;

  saveContactLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private contactHttpRequest: ContactHttpRequestsService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  close() {
    this.activeModal?.close();
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      id: [this.contact.id || null],
      firstName: [this.contact.firstName || null, Validators.required],
      surname: [this.contact.surname || null, [Validators.required]],
      phone: [this.contact.phone || null, [Validators.required]],
      extension: [this.contact.extension || null, [Validators.required]],
      mobile: [this.contact.mobile || null, [Validators.required]],
      email: [this.contact.email || null, [Validators.required]],
      notes: [this.contact.notes || null, [Validators.required]],
      mainContact: [this.contact.mainContact || false, [Validators.required]],
      departmentId: [this.department.id || null, [Validators.required]],
    });
  }

  addContact() {
    this.loadingService.show(this.contact.id ? 'Updating contact...' : 'Adding contact...');
    if(!this.contactForm.valid) {
      console.error('Form is invalid');
      return;
    }

    this.saveContactLoading = true;
    this.contact = this.contactForm.value;
    const formValue = this.contactForm.value;

    const contactData: Contact = this.contact?.id
      ? formValue
      : (({ id, ...rest }) => rest)(formValue);


    const operation = this.contact.id ?
      this.contactHttpRequest.editContact(contactData) :
      this.contactHttpRequest.addContact(contactData);

    operation.subscribe({
      next: (response) => {
        this.saveContactLoading = false;
        this.contact = response;
        this.loadingService.hide();
        this.activeModal.close(this.contact);
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error adding contact:', error);
      }
    });
  }

}
