import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
// Service
import { AuthService } from 'src/app/core/services/authentication/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading = false;
  showPassword = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    ) {
      // Redirect if already logged in - UPDATED ROUTE
      if (this.authService.currentUserValue) {
        this.router.navigate(['/dashboard']); // Changed from '/pages/dashboard'
      }
     }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  get isFormInvalid(): boolean {
    return this.loginForm.invalid;
  }

  /**
   * Form submit
   */
   onSubmit(): void {
    if (this.isFormInvalid) return;

    this.loading = true;
    this.error = '';

    const { userName, password, rememberMe } = this.loginForm.value;
    
    this.authService.login(
      userName, 
      password, 
      'GPFocusAngular', 
      'password', 
      '', 
      rememberMe
    )
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard'; // Changed from '/pages/dashboard'
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.error = error?.message || 'Login failed. Please try again.';
      }
    });
  }

  handleError(response: HttpErrorResponse): void {
    console.log(response)
  }

  /**
   * Password Hide/Show
   */
   togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

}
