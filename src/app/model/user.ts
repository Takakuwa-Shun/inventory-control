export interface User {
    uid: string;
    email: string;
    displayName: string;
}

export interface UserRegister extends User {
    password: string
}