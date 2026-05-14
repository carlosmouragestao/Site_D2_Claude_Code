/**
 * ESTOQUE D2 MOTOS — Banco de dados das motos à venda
 *
 * Como adicionar uma moto:
 *   1. Copie um objeto do array abaixo
 *   2. Atribua um "id" único (sempre incrementar o maior existente)
 *   3. Preencha todos os campos
 *   4. Coloque a(s) foto(s) na pasta  fotos/  e referencie em "fotos"
 *
 * Como remover uma moto: apague o objeto inteiro do array.
 *
 * Badges disponíveis: "DESTAQUE" | "ABAIXO DA FIPE" | "NOVO NO ESTOQUE" | null
 *
 * Atenção: as fotos devem estar na pasta fotos/ na raiz do projeto.
 * Os arquivos originais estão em "Estoque Motos/" — copie e renomeie se necessário.
 */

const MOTOS = [
  {
    id: 1,
    marca: "Honda",
    modelo: "Biz 110i",
    ano: 2022,
    cor: "Prata",
    cilindrada: "110cc",
    km: 18400,
    preco: 8900,
    fotos: ["fotos/biz_110i.webp"],
    badge: null,
    descricao: "Moto em ótimo estado de conservação, revisões em dia, ideal para o dia a dia e entregas. Documentação ok, sem débitos."
  },
  {
    id: 2,
    marca: "Honda",
    modelo: "CG 160 Titan",
    ano: 2021,
    cor: "Vermelho",
    cilindrada: "160cc",
    km: 27800,
    preco: 12500,
    fotos: ["fotos/cg_160_titan.webp"],
    badge: "DESTAQUE",
    descricao: "Moto muito conservada, pneus novos, freios revisados. Excelente para trabalho e uso urbano. Com manual e chave reserva."
  },
  {
    id: 3,
    marca: "Honda",
    modelo: "Pop 110i",
    ano: 2021,
    cor: "Branco",
    cilindrada: "110cc",
    km: 22100,
    preco: 7400,
    fotos: ["fotos/honda-pop-110i-2021.jpg"],
    badge: null,
    descricao: "Moto econômica e confiável, ideal para iniciantes. Motor original, sem batidas ou reformas. Documentação em dia."
  },
  {
    id: 4,
    marca: "Yamaha",
    modelo: "Fazer 150",
    ano: 2022,
    cor: "Azul",
    cilindrada: "150cc",
    km: 19600,
    preco: 14800,
    fotos: ["fotos/yamaha-fazer-150-2022.jpg"],
    badge: "NOVO NO ESTOQUE",
    descricao: "Esportiva e econômica, em excelente estado. Freio a disco dianteiro, partida elétrica. Revisada e pronta para transferência."
  },
  {
    id: 5,
    marca: "Yamaha",
    modelo: "Fazer FZ25",
    ano: 2024,
    cor: "Cinza/Verde",
    cilindrada: "250cc",
    km: 4200,
    preco: 24900,
    fotos: ["fotos/Yamaha-Fazer-FZ25-2024.webp"],
    badge: "ABAIXO DA FIPE",
    descricao: "Seminova com pouquíssimo uso, ainda na garantia de fábrica. Motor 250cc, painel digital, freios ABS. A moto mais completa do estoque."
  }
];
