/**
 * Filtra o array de motos conforme os critérios ativos.
 * Função pura — sem efeitos colaterais.
 *
 * @param {Array}  motos   - array completo (MOTOS)
 * @param {Object} filters - objeto com os filtros ativos
 * @returns {Array} subconjunto filtrado
 */
function filterMotos(motos, filters) {
  return motos.filter(function (moto) {

    // Busca textual livre (marca, modelo, ano, cor, cilindrada)
    if (filters.search) {
      var q = filters.search.toLowerCase().trim();
      var haystack = [moto.marca, moto.modelo, String(moto.ano), moto.cor, moto.cilindrada]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.marca      && moto.marca      !== filters.marca)      return false;
    if (filters.modelo     && moto.modelo     !== filters.modelo)     return false;
    if (filters.cilindrada && moto.cilindrada !== filters.cilindrada) return false;

    if (filters.precoMin !== '' && moto.preco < Number(filters.precoMin)) return false;
    if (filters.precoMax !== '' && moto.preco > Number(filters.precoMax)) return false;

    if (filters.anoMin !== '' && moto.ano < Number(filters.anoMin)) return false;
    if (filters.anoMax !== '' && moto.ano > Number(filters.anoMax)) return false;

    if (filters.kmMin !== '' && moto.km < Number(filters.kmMin)) return false;
    if (filters.kmMax !== '' && moto.km > Number(filters.kmMax)) return false;

    return true;
  });
}
