import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface SetupStatus {
  canSetup: boolean;
  status: string;
  message: string;
}

export interface SetupAdminRequest {
  invitationCode: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface SetupResponse {
  success: boolean;
  message: string;
  username?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  private readonly API_URL = 'http://localhost:8080/api/setup';
  
  // Using signals for reactive state
  public setupStatus = signal<SetupStatus | null>(null);
  public isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  checkSetupStatus(): Observable<SetupStatus> {
    this.isLoading.set(true);
    return this.http.get<SetupStatus>(`${this.API_URL}/status`).pipe(
      tap(status => {
        this.setupStatus.set(status);
        this.isLoading.set(false);
      })
    );
  }

  createFirstAdmin(request: SetupAdminRequest): Observable<SetupResponse> {
    this.isLoading.set(true);
    return this.http.post<SetupResponse>(`${this.API_URL}/create-first-admin`, request).pipe(
      tap(() => {
        this.isLoading.set(false);
      })
    );
  }

  getSetupStatusValue(): SetupStatus | null {
    return this.setupStatus();
  }
}