import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserSettingsHttpRequestsService } from 'src/app/core/services/http-requests/user-settings-http-requests.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  userSettingForm!: FormGroup;
  submitted: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private httpRequest: UserSettingsHttpRequestsService,
  ) { }

  ngOnInit(): void {
    this.getUserSetting();
  }

  getUserSetting() {
        this.httpRequest.getUserSettings().subscribe(data => {
            if(data.length != 0) {
                this.initForm(data[0]);
            }
        })
    }

    initForm(userSetting: any) {
        console.log(userSetting);
        let offlineMode: boolean = (this.getOfflineMode());
        this.userSettingForm = this.formBuilder.group({
            firstName: [userSetting.user.firstName, [Validators.required]],
            lastName: [userSetting.user.lastName, [Validators.required]],
            debugMode: [userSetting.debugMode, Validators.required],
            offlineMode: [this.getOfflineMode(), Validators.required],
          });
    }

    get f() { return this.userSettingForm.controls; }

    save() {
        this.submitted = true;
        console.log(this.userSettingForm.invalid);
        console.log(this.userSettingForm.value);
        if(this.userSettingForm.invalid) {
            return;
        } else {
            this.httpRequest.editUserSettings(this.userSettingForm.value).subscribe(data => {
                this.getUserSetting();
                // this.commonService.setOfflineMode(this.userSettingForm.controls['offlineMode'].value);
            })
        }
        
    }

    getOfflineMode(): boolean {
      return false;
        // return this.commonService.getOfflineMode();
    }

}
