import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, throwError, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticatedUser } from '../../models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private baseUrl = environment.api;
    private currentUserSubject = new BehaviorSubject<AuthenticatedUser | null>(this.getStoredUser());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    public get currentUserValue(): AuthenticatedUser | null {
        return this.currentUserSubject.value;
    }

    login(userName: string, password: string, clientId: string, grant_type: string, clientSecret: string, rememberMe: boolean): Observable<any> {
        const loginData = { userName, password, clientId, grant_type, clientSecret, rememberMe };
        
        return this.http.post<any>(`${this.baseUrl}Login`, loginData)
            .pipe(
                switchMap(user => {
                    if (user?.accessToken) {
                        return this.getUserProfile(user, 'login');
                    }
                    throw new Error('Invalid login response');
                })
            );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']); // Make sure this is correct
    }

    refreshToken(refreshToken: string): Observable<AuthenticatedUser> {
        const payload = {
            clientId: "GPFocusAngular",
            refreshToken
        };
        
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Skip-Interceptor': 'true'  // This prevents infinite loops
        });
        
        return this.http.post<any>(`${this.baseUrl}Login/refreshToken`, payload, { headers })
            .pipe(
                switchMap(tokenData => {
                    if (tokenData?.accessToken) {
                        // Update the current user with new tokens immediately
                        const currentUser = this.currentUserValue;
                        if (currentUser) {
                            const updatedUser = {
                                ...currentUser,
                                accessToken: tokenData.accessToken,
                                refreshToken: tokenData.refreshToken || currentUser.refreshToken
                            };
                            
                            // Update localStorage and subject immediately
                            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                            this.currentUserSubject.next(updatedUser);
                            
                            // Return the updated user immediately
                            return of(updatedUser);
                        } else {
                            // If no current user, get user profile
                            return this.getUserProfile(tokenData, 'refresh');
                        }
                    }
                    throw new Error('Invalid refresh token response');
                }),
                catchError(error => {
                    console.error('Token refresh failed:', error);
                    this.logout();
                    return throwError(error);
                })
            );
    }

    getToken(): string | null {
        const user = this.currentUserValue;
        return user?.accessToken || null;
    }

    getRefreshToken(): string | null {
        const user = this.currentUserValue;
        return user?.refreshToken || null;
    }

    getUserProfile(tokenData: any, type: 'login' | 'refresh'): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.accessToken}`
        });

        // Use forkJoin to make parallel requests
        const profile$ = this.http.get<any>(`${this.baseUrl}user/profile`, { headers });
        const role$ = this.http.get<any>(`${this.baseUrl}user/role`, { headers });

        return forkJoin({ profile: profile$, role: role$ }).pipe(
            map(({ profile, role }) => {
                const currentUser: AuthenticatedUser = {
                    accessToken: tokenData.accessToken,
                    expiresIn: tokenData.expiresIn,
                    isAdmin: tokenData.isAdmin,
                    issued: tokenData.issued,
                    refreshToken: tokenData.refreshToken,
                    email: profile.email,
                    lastName: profile.lastName,
                    firstName: profile.firstName,
                    userId: profile.userId,
                    role: role
                };

                this.currentUserSubject.next(currentUser);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                if (type === 'login') {
                    this.router.navigate(['/dashboard']); // Changed from '/pages/dashboard'
                }

                return currentUser;
            })
        );
    }

    private getStoredUser(): AuthenticatedUser | null {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
}
