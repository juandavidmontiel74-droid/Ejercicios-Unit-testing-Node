const ProductService = require('../src/productService');

// Repositorio simulado: todas sus funciones son mocks rastreables
const mockRepo = {
  findAll:  jest.fn(),
  findById: jest.fn(),
  save:     jest.fn(),
};

describe('ProductService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();                  // limpia historial entre tests
    service = new ProductService(mockRepo);
  });

  // ── getById() ──────────────────────────────────────────────────────────────
  describe('getById()', () => {
    it('devuelve el producto cuando existe', async () => {
      // Arrange
      const product = { id: 1, name: 'Teclado', price: 50, category: 'periféricos' };
      mockRepo.findById.mockResolvedValue(product);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result).toEqual(product);
    });

    it('llama al repositorio con el ID correcto', async () => {
      mockRepo.findById.mockResolvedValue({ id: 5, name: 'Monitor', price: 300 });

      await service.getById(5);

      expect(mockRepo.findById).toHaveBeenCalledWith(5);
      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    });

    it('lanza Error si el producto no existe', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getById(99)).rejects.toThrow('Producto con id 99 no encontrado.');
    });
  });

  // ── getByCategory() ────────────────────────────────────────────────────────
  describe('getByCategory()', () => {
    const products = [
      { id: 1, name: 'Teclado',  price: 50,  category: 'periféricos' },
      { id: 2, name: 'Monitor',  price: 300, category: 'pantallas'   },
      { id: 3, name: 'Ratón',    price: 30,  category: 'periféricos' },
    ];

    it('devuelve solo los productos de la categoría indicada', async () => {
      mockRepo.findAll.mockResolvedValue(products);

      const result = await service.getByCategory('periféricos');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === 'periféricos')).toBe(true);
    });

    it('devuelve array vacío si no hay productos en esa categoría', async () => {
      mockRepo.findAll.mockResolvedValue(products);

      const result = await service.getByCategory('audio');

      expect(result).toEqual([]);
    });
  });

  // ── searchByName() ─────────────────────────────────────────────────────────
  describe('searchByName()', () => {
    const products = [
      { id: 1, name: 'Teclado Mecánico', price: 80,  category: 'periféricos' },
      { id: 2, name: 'Teclado Membrana', price: 20,  category: 'periféricos' },
      { id: 3, name: 'Monitor 4K',       price: 400, category: 'pantallas'   },
    ];

    it('devuelve los productos cuyo nombre contiene el query', async () => {
      mockRepo.findAll.mockResolvedValue(products);

      const result = await service.searchByName('Teclado');

      expect(result).toHaveLength(2);
    });

    it('la búsqueda es case-insensitive', async () => {
      mockRepo.findAll.mockResolvedValue(products);

      const result = await service.searchByName('teclado');

      expect(result).toHaveLength(2);
    });

    it('devuelve array vacío si ningún producto coincide', async () => {
      mockRepo.findAll.mockResolvedValue(products);

      const result = await service.searchByName('auriculares');

      expect(result).toEqual([]);
    });

    it('lanza Error si el query está vacío', async () => {
      await expect(service.searchByName('')).rejects.toThrow('vacío');
    });

    it('lanza Error si el query es solo espacios', async () => {
      await expect(service.searchByName('   ')).rejects.toThrow(Error);
    });
  });

  // ── create() ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('llama a save() con los datos correctos y devuelve el producto guardado', async () => {
      // Arrange
      const newProduct = { name: 'Webcam', price: 75, category: 'periféricos' };
      const saved      = { id: 10, ...newProduct };
      mockRepo.save.mockResolvedValue(saved);

      // Act
      const result = await service.create(newProduct);

      // Assert
      expect(result).toEqual(saved);
      expect(mockRepo.save).toHaveBeenCalledWith(newProduct);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });

    it('lanza Error si el nombre está ausente', async () => {
      await expect(service.create({ price: 50 })).rejects.toThrow(Error);
    });

    it('lanza Error si el nombre es una cadena vacía', async () => {
      await expect(service.create({ name: '', price: 50 })).rejects.toThrow(Error);
    });

    it('lanza Error si el precio es negativo', async () => {
      await expect(service.create({ name: 'Producto', price: -10 })).rejects.toThrow(Error);
    });

    it('lanza Error si el precio es cero', async () => {
      await expect(service.create({ name: 'Producto', price: 0 })).rejects.toThrow(Error);
    });

    it('lanza Error si el precio está ausente', async () => {
      await expect(service.create({ name: 'Producto' })).rejects.toThrow(Error);
    });

    it('no llama a save() cuando los datos son inválidos', async () => {
      await expect(service.create({ name: '', price: -5 })).rejects.toThrow(Error);

      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

});
