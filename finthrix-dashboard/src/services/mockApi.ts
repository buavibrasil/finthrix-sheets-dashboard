import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';

// Simulação de banco de dados em memória
const mockUsers: User[] = [];
let nextUserId = 1;

// Função para gerar token JWT mock
const generateMockToken = (userId: string): string => {
  return `mock-jwt-token-${userId}-${Date.now()}`;
};

// Função para gerar refresh token mock
const generateMockRefreshToken = (userId: string): string => {
  return `mock-refresh-token-${userId}-${Date.now()}`;
};

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Mock do login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800); // Simular delay de rede

    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Em um sistema real, verificaríamos a senha hash
    // Aqui vamos aceitar qualquer senha para demonstração
    
    const token = generateMockToken(user.id);
    const refreshToken = generateMockRefreshToken(user.id);

    return {
      user,
      token,
      refreshToken,
      expiresIn: 3600, // 1 hora
    };
  },

  // Mock do registro
  async register(userData: RegisterData): Promise<AuthResponse> {
    await delay(1000); // Simular delay de rede

    // Verificar se email já existe
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Criar novo usuário
    const newUser: User = {
      id: (nextUserId++).toString(),
      name: userData.name,
      email: userData.email,
      role: 'user',
      permissions: ['read'],
      createdAt: new Date().toISOString(),
      emailVerified: false,
    };

    mockUsers.push(newUser);

    const token = generateMockToken(newUser.id);
    const refreshToken = generateMockRefreshToken(newUser.id);

    return {
      user: newUser,
      token,
      refreshToken,
      expiresIn: 3600, // 1 hora
    };
  },

  // Mock do logout
  async logout(): Promise<void> {
    await delay(300);
    // Em um sistema real, invalidaríamos o token no servidor
    return;
  },

  // Mock do refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    await delay(500);
    
    // Extrair userId do refresh token mock
    const match = refreshToken.match(/mock-refresh-token-(\d+)-/);
    if (!match) {
      throw new Error('Refresh token inválido');
    }

    const userId = match[1];
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newToken = generateMockToken(user.id);
    const newRefreshToken = generateMockRefreshToken(user.id);

    return {
      user,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600, // 1 hora
    };
  },

  // Mock do getCurrentUser
  async getCurrentUser(token: string): Promise<User> {
    await delay(400);
    
    // Extrair userId do token mock
    const match = token.match(/mock-jwt-token-(\d+)-/);
    if (!match) {
      throw new Error('Token inválido');
    }

    const userId = match[1];
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  },

  // Mock do forgot password
  async forgotPassword(email: string): Promise<void> {
    await delay(800);
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Email não encontrado');
    }

    // Em um sistema real, enviaríamos um email
    console.log(`Email de recuperação enviado para: ${email}`);
  },

  // Mock do reset password
  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    await delay(600);
    
    // Em um sistema real, verificaríamos o token de reset
    console.log('Senha redefinida com sucesso');
  },
};

// Adicionar alguns usuários de exemplo para testes
mockUsers.push({
  id: (nextUserId++).toString(),
  name: 'Usuário Teste',
  email: 'teste@exemplo.com',
  role: 'user',
  permissions: ['read'],
  createdAt: new Date().toISOString(),
  emailVerified: true,
});