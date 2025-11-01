import User from '../models/User';
export declare class UserService {
    private userRepository;
    constructor();
    createUser(userData: any): Promise<User>;
    getAllUsers(): Promise<User[]>;
    findUserById(id: string | number): Promise<User>;
    findUserByEmail(email: string, shouldThrowError?: boolean): Promise<User | null>;
    updateUser(id: string | number, updates: Partial<User>): Promise<User>;
    deleteUser(id: string | number): Promise<boolean>;
    findUserByResetToken(token: string): Promise<User>;
    findUserByVerificationToken(token: string): Promise<User>;
    updateUserVerification(user: User, verificationCode: string, verificationToken: string): Promise<User>;
    markUserAsVerified(user: User): Promise<User>;
    setPasswordResetDetails(user: User, hashedToken: string): Promise<User>;
    updateUserPassword(user: User, hashedPassword: string): Promise<User>;
}
//# sourceMappingURL=UserService.d.ts.map