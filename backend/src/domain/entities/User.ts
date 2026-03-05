export interface UserProps {
  email: string;
  name: string;
  passwordHash?: string;
  provider?: string;
}

export class User {
  public readonly id?: string;
  public email: string;
  public name: string;
  public passwordHash?: string;
  public provider: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(props: UserProps, id?: string) {
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.provider = props.provider || 'email';
    this.id = id;
  }

  // Comportamentos / Regras de Negócio de Usuário ficariam aqui
  public isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}
