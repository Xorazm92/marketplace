export class User {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly profileImg?: string,
    public readonly isActive: boolean = true,
    public readonly isPremium: boolean = false,
    public readonly birthDate?: string,
    public readonly balance: number = 0,
    public readonly slug?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAdult(): boolean {
    if (!this.birthDate) return false;
    const age = this.calculateAge();
    return age >= 18;
  }

  private calculateAge(): number {
    const birthDate = new Date(this.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  canAfford(amount: number): boolean {
    return this.balance >= amount;
  }

  deductBalance(amount: number): User {
    if (!this.canAfford(amount)) {
      throw new Error('Insufficient balance');
    }
    
    return new User(
      this.id,
      this.firstName,
      this.lastName,
      this.email,
      this.profileImg,
      this.isActive,
      this.isPremium,
      this.birthDate,
      this.balance - amount,
      this.slug,
      this.createdAt,
      new Date()
    );
  }

  addBalance(amount: number): User {
    return new User(
      this.id,
      this.firstName,
      this.lastName,
      this.email,
      this.profileImg,
      this.isActive,
      this.isPremium,
      this.birthDate,
      this.balance + amount,
      this.slug,
      this.createdAt,
      new Date()
    );
  }
}
