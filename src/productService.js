/**
 * Ejercicio 4 — ProductService
 * Servicio asíncrono con inyección de dependencias.
 */

class ProductService {
  constructor(productRepository) {
    this.repo = productRepository;
  }

  /**
   * Obtiene un producto por ID. Lanza Error si no existe.
   * @param {*} id
   * @returns {Promise<object>}
   */
  async getById(id) {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new Error(`Producto con id ${id} no encontrado.`);
    }
    return product;
  }

  /**
   * Devuelve todos los productos que pertenecen a la categoría indicada.
   * @param {string} category
   * @returns {Promise<object[]>}
   */
  async getByCategory(category) {
    const all = await this.repo.findAll();
    return all.filter(p => p.category === category);
  }

  /**
   * Devuelve los productos cuyo nombre contiene query (case-insensitive).
   * Lanza Error si query está vacío.
   * @param {string} query
   * @returns {Promise<object[]>}
   */
  async searchByName(query) {
    if (typeof query !== 'string' || query.trim() === '') {
      throw new Error('El query de búsqueda no puede estar vacío.');
    }
    const all = await this.repo.findAll();
    const lower = query.toLowerCase();
    return all.filter(p => p.name.toLowerCase().includes(lower));
  }

  /**
   * Valida y crea un producto nuevo.
   * Lanza Error si name o price faltan, o si price <= 0.
   * @param {{ name: string, price: number, [key: string]: any }} productData
   * @returns {Promise<object>}
   */
  async create(productData) {
    if (!productData.name || typeof productData.name !== 'string' || productData.name.trim() === '') {
      throw new Error('El nombre del producto es obligatorio.');
    }
    if (productData.price === undefined || productData.price === null) {
      throw new Error('El precio del producto es obligatorio.');
    }
    if (typeof productData.price !== 'number' || productData.price <= 0) {
      throw new Error('El precio debe ser un número mayor que 0.');
    }
    return this.repo.save(productData);
  }
}

module.exports = ProductService;
