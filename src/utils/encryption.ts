import { SecureLogger } from './security-validator';

/**
 * Utilitário de Criptografia para Dados Sensíveis
 * 
 * Implementa criptografia AES-GCM para proteger dados sensíveis
 * tanto em trânsito quanto em repouso (localStorage/sessionStorage)
 */

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  timestamp: number;
}

export interface EncryptionOptions {
  keyDerivationIterations?: number;
  algorithm?: string;
  keyLength?: number;
  ivLength?: number;
  saltLength?: number;
  expirationTime?: number; // em milissegundos
}

export class CryptoUtils {
  private static readonly DEFAULT_OPTIONS: Required<EncryptionOptions> = {
    keyDerivationIterations: 100000,
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12,
    saltLength: 16,
    expirationTime: 24 * 60 * 60 * 1000 // 24 horas
  };

  /**
   * Gerar uma chave de criptografia derivada de uma senha
   */
  private static async deriveKey(
    password: string, 
    salt: Uint8Array, 
    options: EncryptionOptions = {}
  ): Promise<CryptoKey> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Importar a senha como material de chave
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      // Derivar a chave usando PBKDF2
      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: opts.keyDerivationIterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: opts.algorithm,
          length: opts.keyLength
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      SecureLogger.logError('Erro na derivação de chave', error as Error);
      throw new Error('Falha na derivação de chave de criptografia');
    }
  }

  /**
   * Criptografar dados sensíveis
   */
  static async encrypt(
    data: string, 
    password: string, 
    options: EncryptionOptions = {}
  ): Promise<EncryptedData> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Gerar salt e IV aleatórios
      const salt = crypto.getRandomValues(new Uint8Array(opts.saltLength));
      const iv = crypto.getRandomValues(new Uint8Array(opts.ivLength));
      
      // Derivar chave
      const key = await this.deriveKey(password, salt, options);
      
      // Criptografar dados
      const encodedData = new TextEncoder().encode(data);
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: opts.algorithm,
          iv: iv
        },
        key,
        encodedData
      );
      
      // Converter para base64 para armazenamento
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
      const saltBase64 = btoa(String.fromCharCode(...salt));
      const ivBase64 = btoa(String.fromCharCode(...iv));
      
      const result: EncryptedData = {
        data: encryptedBase64,
        iv: ivBase64,
        salt: saltBase64,
        timestamp: Date.now()
      };
      
      SecureLogger.logInfo('Dados criptografados com sucesso');
      return result;
      
    } catch (error) {
      SecureLogger.logError('Erro na criptografia', error as Error);
      throw new Error('Falha na criptografia dos dados');
    }
  }

  /**
   * Descriptografar dados sensíveis
   */
  static async decrypt(
    encryptedData: EncryptedData, 
    password: string, 
    options: EncryptionOptions = {}
  ): Promise<string> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Verificar expiração
      if (opts.expirationTime > 0) {
        const age = Date.now() - encryptedData.timestamp;
        if (age > opts.expirationTime) {
          throw new Error('Dados criptografados expiraram');
        }
      }
      
      // Converter de base64
      const encryptedArray = new Uint8Array(
        atob(encryptedData.data).split('').map(char => char.charCodeAt(0))
      );
      const salt = new Uint8Array(
        atob(encryptedData.salt).split('').map(char => char.charCodeAt(0))
      );
      const iv = new Uint8Array(
        atob(encryptedData.iv).split('').map(char => char.charCodeAt(0))
      );
      
      // Derivar chave
      const key = await this.deriveKey(password, salt, options);
      
      // Descriptografar
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: opts.algorithm,
          iv: iv
        },
        key,
        encryptedArray
      );
      
      const decryptedData = new TextDecoder().decode(decryptedBuffer);
      
      SecureLogger.logInfo('Dados descriptografados com sucesso');
      return decryptedData;
      
    } catch (error) {
      SecureLogger.logError('Erro na descriptografia', error as Error);
      throw new Error('Falha na descriptografia dos dados');
    }
  }

  /**
   * Gerar hash seguro de uma string
   */
  static async hash(data: string, algorithm: string = 'SHA-256'): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
      const hashArray = new Uint8Array(hashBuffer);
      const hashHex = Array.from(hashArray)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      
      return hashHex;
    } catch (error) {
      SecureLogger.logError('Erro na geração de hash', error as Error);
      throw new Error('Falha na geração de hash');
    }
  }

  /**
   * Verificar se um hash corresponde aos dados originais
   */
  static async verifyHash(data: string, hash: string, algorithm: string = 'SHA-256'): Promise<boolean> {
    try {
      const computedHash = await this.hash(data, algorithm);
      return computedHash === hash;
    } catch (error) {
      SecureLogger.logError('Erro na verificação de hash', error as Error);
      return false;
    }
  }

  /**
   * Gerar uma chave aleatória segura
   */
  static generateSecureKey(length: number = 32): string {
    try {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      SecureLogger.logError('Erro na geração de chave segura', error as Error);
      throw new Error('Falha na geração de chave segura');
    }
  }
}

/**
 * Gerenciador de Armazenamento Seguro
 * 
 * Fornece métodos para armazenar dados sensíveis de forma criptografada
 * no localStorage ou sessionStorage
 */
export class SecureStorage {
  private static readonly STORAGE_PREFIX = 'finthrix_secure_';
  private static readonly MASTER_KEY_KEY = 'finthrix_master_key';

  /**
   * Obter ou gerar chave mestra para criptografia
   */
  private static async getMasterKey(): Promise<string> {
    try {
      let masterKey = sessionStorage.getItem(this.MASTER_KEY_KEY);
      
      if (!masterKey) {
        // Gerar nova chave mestra
        masterKey = CryptoUtils.generateSecureKey(32);
        sessionStorage.setItem(this.MASTER_KEY_KEY, masterKey);
        SecureLogger.logInfo('Nova chave mestra gerada');
      }
      
      return masterKey;
    } catch (error) {
      SecureLogger.logError('Erro ao obter chave mestra', error as Error);
      throw new Error('Falha ao obter chave mestra');
    }
  }

  /**
   * Armazenar dados de forma segura
   */
  static async setItem(
    key: string, 
    value: string, 
    useSessionStorage: boolean = true,
    options: EncryptionOptions = {}
  ): Promise<void> {
    try {
      const masterKey = await this.getMasterKey();
      const encryptedData = await CryptoUtils.encrypt(value, masterKey, options);
      const storageKey = this.STORAGE_PREFIX + key;
      
      const storage = useSessionStorage ? sessionStorage : localStorage;
      storage.setItem(storageKey, JSON.stringify(encryptedData));
      
      SecureLogger.logInfo(`Dados armazenados de forma segura: ${key}`);
    } catch (error) {
      SecureLogger.logError('Erro ao armazenar dados seguros', error as Error, { key });
      throw new Error('Falha ao armazenar dados de forma segura');
    }
  }

  /**
   * Recuperar dados armazenados de forma segura
   */
  static async getItem(
    key: string, 
    useSessionStorage: boolean = true,
    options: EncryptionOptions = {}
  ): Promise<string | null> {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const storageKey = this.STORAGE_PREFIX + key;
      const encryptedDataStr = storage.getItem(storageKey);
      
      if (!encryptedDataStr) {
        return null;
      }
      
      const encryptedData: EncryptedData = JSON.parse(encryptedDataStr);
      const masterKey = await this.getMasterKey();
      const decryptedValue = await CryptoUtils.decrypt(encryptedData, masterKey, options);
      
      SecureLogger.logInfo(`Dados recuperados de forma segura: ${key}`);
      return decryptedValue;
      
    } catch (error) {
      SecureLogger.logError('Erro ao recuperar dados seguros', error as Error, { key });
      // Remover dados corrompidos
      this.removeItem(key, useSessionStorage);
      return null;
    }
  }

  /**
   * Remover dados armazenados
   */
  static removeItem(key: string, useSessionStorage: boolean = true): void {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const storageKey = this.STORAGE_PREFIX + key;
      storage.removeItem(storageKey);
      
      SecureLogger.logInfo(`Dados seguros removidos: ${key}`);
    } catch (error) {
      SecureLogger.logError('Erro ao remover dados seguros', error as Error, { key });
    }
  }

  /**
   * Limpar todos os dados seguros
   */
  static clearAll(useSessionStorage: boolean = true): void {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => storage.removeItem(key));
      
      // Remover chave mestra também
      if (useSessionStorage) {
        sessionStorage.removeItem(this.MASTER_KEY_KEY);
      }
      
      SecureLogger.logInfo(`${keysToRemove.length} itens de dados seguros removidos`);
    } catch (error) {
      SecureLogger.logError('Erro ao limpar dados seguros', error as Error);
    }
  }

  /**
   * Verificar se um item existe
   */
  static hasItem(key: string, useSessionStorage: boolean = true): boolean {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const storageKey = this.STORAGE_PREFIX + key;
      return storage.getItem(storageKey) !== null;
    } catch (error) {
      SecureLogger.logError('Erro ao verificar existência de dados seguros', error as Error, { key });
      return false;
    }
  }
}

/**
 * Hook React para usar armazenamento seguro
 */
export const useSecureStorage = () => {
  const setSecureItem = async (
    key: string, 
    value: string, 
    useSessionStorage: boolean = true,
    options?: EncryptionOptions
  ) => {
    return SecureStorage.setItem(key, value, useSessionStorage, options);
  };

  const getSecureItem = async (
    key: string, 
    useSessionStorage: boolean = true,
    options?: EncryptionOptions
  ) => {
    return SecureStorage.getItem(key, useSessionStorage, options);
  };

  const removeSecureItem = (key: string, useSessionStorage: boolean = true) => {
    return SecureStorage.removeItem(key, useSessionStorage);
  };

  const clearSecureStorage = (useSessionStorage: boolean = true) => {
    return SecureStorage.clearAll(useSessionStorage);
  };

  const hasSecureItem = (key: string, useSessionStorage: boolean = true) => {
    return SecureStorage.hasItem(key, useSessionStorage);
  };

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem,
    clearSecureStorage,
    hasSecureItem
  };
};