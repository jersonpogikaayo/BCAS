import { Injectable } from '@angular/core';
import { SimpleUser, User } from '../../models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
     // Transform users for modal display
    transformUsersForModal(users: User[]): SimpleUser[] {
        return users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName,
        level: user.level,
        isArchived: user.isArchived,
        joinDate: new Date(user.joinDate),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        phoneNumber: user.phoneNumber,
        managers: user.managers.map((manager: any) => ({
            id: manager.id,
            firstName: manager.firstName,
            lastName: manager.lastName,
            email: manager.email,
            userName: manager.userName,
            level: manager.level,
            isArchived: manager.isArchived,
            joinDate: new Date(manager.joinDate),
            lastLogin: manager.lastLogin ? new Date(manager.lastLogin) : null,
            phoneNumber: manager.phoneNumber,
            managers: []
        }))
        }));
    }

}