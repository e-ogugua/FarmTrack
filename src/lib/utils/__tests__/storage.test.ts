import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { storage } from '../storage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(),
  close: vi.fn(),
}

const mockTransaction = {
  objectStore: vi.fn(),
}

const mockObjectStore = {
  add: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  getAll: vi.fn(),
}

// Access the global indexedDB mock from setup
const indexedDBMock = window.indexedDB as unknown as {
  open: ReturnType<typeof vi.fn>
  deleteDatabase: ReturnType<typeof vi.fn>
}

describe('Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup IndexedDB mock responses
    mockObjectStore.add.mockReturnValue({
      onsuccess: null,
      onerror: null,
      result: 'test-id'
    })

    mockObjectStore.get.mockReturnValue({
      onsuccess: null,
      onerror: null,
      result: null
    })

    mockObjectStore.getAll.mockReturnValue({
      onsuccess: null,
      onerror: null,
      result: []
    })

    mockTransaction.objectStore.mockReturnValue(mockObjectStore)
    mockDB.transaction.mockReturnValue(mockTransaction)

    indexedDBMock.open.mockReturnValue({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: mockDB
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('set method', () => {
    it('should store data in localStorage when IndexedDB is not available', () => {
      // Mock localStorage to return data
      localStorageMock.getItem.mockReturnValue('[]')

      const testData = [{ id: '1', name: 'Test Item' }]

      storage.set('test-store', testData)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-store',
        JSON.stringify(testData)
      )
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      expect(() => {
        storage.set('test-store', [{ id: '1' }])
      }).not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error writing to localStorage key "test-store":',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('get method', () => {
    it('should retrieve data from localStorage with default value', () => {
      const defaultValue: Array<{ id: string }> = []
      localStorageMock.getItem.mockReturnValue(JSON.stringify([{ id: '1' }]))

      const result = storage.get('test-store', defaultValue)

      expect(result).toEqual([{ id: '1' }])
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-store')
    })

    it('should return default value when localStorage is empty', () => {
      const defaultValue: Array<{ id: string }> = []
      localStorageMock.getItem.mockReturnValue(null)

      const result = storage.get('test-store', defaultValue)

      expect(result).toEqual(defaultValue)
    })

    it('should handle malformed JSON gracefully', () => {
      const defaultValue: Array<{ id: string }> = []
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const result = storage.get('test-store', defaultValue)

      expect(result).toEqual(defaultValue)
    })
  })

  describe('remove method', () => {
    it('should remove data from localStorage', () => {
      storage.remove('test-store')

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-store')
    })
  })

  describe('clear method', () => {
    it('should clear all data from localStorage', () => {
      storage.clear()

      expect(localStorageMock.clear).toHaveBeenCalled()
    })
  })
})
