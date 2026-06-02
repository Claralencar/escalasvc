# Auto Escala

Sistema para geração automática de escalas de serviço, desenvolvido para facilitar a organização e o gerenciamento de alunos que participam das escalas.

A plataforma elimina a necessidade de montar a escala manualmente, organizando automaticamente os participantes de acordo com regras definidas no sistema.

---

## Funcionalidades

### Cadastro de Alunos
- Registro dos alunos que participam da escala de serviço.
- Cadastro das seguintes informações:
  - Nome de guerra
  - Nome completo
  - Turma
  - Segmento (masculino ou feminino)
  - Função de Comando (está em função ou não?)
  - Estado de saúde (Apto/Não apto ao serviço)
  - Número de matrícula (identificador único)
  - E-mail institucional
- Operações completas de gerenciamento:
  - Criar cadastro
  - Visualizar informações
  - Atualizar dados
  - Remover cadastro

### Configuração das Escalas
- Definição das regras que controlam o funcionamento das escalas.
- Associação de cores aos tipos de escala:
  - Preta: dias úteis (segunda a sexta)
  - Vermelha: finais de semana e feriados
- Criação de diferentes tipos de escala com:
  - Nome da escala
  - Cor associada
  - Dias da semana em que a escala ocorre
- Definição de quem participa da escala:
  - Segmento feminino
  - Segmento masculino
  - Todos os alunos
- Definição da ordem automática da escala:
  - Ordem alfabética por nome de guerra
  - Ordem inversa por nome de guerra
  - Ordem alfabética por nome completo
  - Ordem inversa por nome completo
  - Ordem por número de matrícula
  - Ordem inversa por número de matrícula

### Geração Automática da Escala
- Criação automática de um calendário com os alunos escalados.
- Distribuição dos serviços de acordo com as regras configuradas.
- Atualização automática da escala conforme mudanças no sistema.
- Geração de um PDF com o aditamento da semana seguinte.
- Envio automático do documento para os responsáveis:
  - Comandante de Companhia
  - Sargenteante
  - Outros responsáveis definidos no sistema
 

A escala é gerada automaticamente de acordo com as regras básicas que uma escala de serviço segue:
- Militar escalado tem direito a 48h de descanso
- Militares não aptos por questão de saúde não são escalados
- Militares em função de comando não são escalados

---

## Tecnologias Utilizadas

### Backend
- **Node.js 20**
- **Express**
- **MySQL2**
- **Docker**

### Banco de Dados
- **MySQL 8**
- Executado via Docker

### Frontend
- **JavaScript (ES6+)**
- **React.js com Vite**

### Infraestrutura
- **Docker**
- **Docker Compose**

---

## Estrutura do Projeto
```bash
grupo4-escalasvc/
│
├── backend/          # API REST Node.js e rotas Express
├── frontend/         # Interface Web em React
├── database/         # Scripts de estruturação MySQL
└── mobile/           # Aplicativo React Native (MVP)
    ├── src/
    │   └── services/
    │       └── api.js # Configuração do Axios com IP local
    ├── App.js         # Lógica do CRUD e Interface detalhada
    └── package.json   # Dependências do projeto mobile
```

## Como Executar o Projeto

### Clonar o repositório

```bash
git clone https://github.com/seu-usuario/grupo4-escalasvc.git
cd grupo4-escalasvc
```

---

### Subir o ambiente completo

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Esse comando irá:

- Construir a imagem do backend
- Baixar a imagem do MySQL
- Subir o frontend
- Criar a rede interna entre os serviços

Aguarde até que os containers estejam em execução.

---

### Acessar os serviços

Após subir o ambiente:

- **Backend:** http://localhost:3000  
- **Frontend:** http://localhost:8080  
- **MySQL:** disponível na porta 8081  

---

### Para parar o ambiente

Pressione `Ctrl + C` no terminal onde os containers estão rodando  
ou execute em outro terminal:

```bash
docker compose down
```

---

## Funcionalidade F1: Cadastro de Alunos

A Funcionalidade F1 permite o gerenciamento completo (CRUD) dos alunos que participam da escala. Cada registro de aluno contém as seguintes informações:

* Matricula (Chave Primária)
* Nome de Guerra
* Nome Completo
* Turma
* Segmento (Masculino/Feminino)
* Função (Sim/Não)
* Estado de Saúde (Apto/Não Apto)
* E-mail Institucional
<img width="1715" height="858" alt="Captura de tela 2026-06-01 163112" src="https://github.com/user-attachments/assets/ed69213b-fa5d-42da-a885-b5611d5cce01" />


## Endpoints da API (Funcionalidade F1)
* GET /alunos: Lista todos os alunos cadastrados.

* POST /alunos: Cadastra um novo aluno.

* PUT /alunos/:matricula: Atualiza os dados de um aluno existente.

* DELETE /alunos/:matricula: Remove um aluno do sistema.


## Funcionalidade F2: Cadastro da Escala

A Funcionalidade F2 permite a parametrização das regras que regem a distribuição dos serviços. Através desta interface, define-se quais grupos participam de cada tipo de escala e qual critério de antiguidade/ordenação será aplicado automaticamente pelo sistema.
<img width="1731" height="884" alt="Captura de tela 2026-06-01 163050" src="https://github.com/user-attachments/assets/96fda5c3-26ca-40f7-b96c-e2836e84ab66" />


### Parâmetros de Configuração
Cada escala cadastrada no sistema possui os seguintes atributos:

* **Nome da Escala:** Identificação da escala (ex: "Preta Seg Fem Perm").
* **Cor Associada:**
  * **Preta:** Vinculada automaticamente aos dias úteis (Segunda a Sexta).
  * **Vermelha:** Vinculada a finais de semana e feriados.
* **Segmento Participante:** Define se a escala é restrita ao segmento **Masculino**, **Feminino** ou se inclui **Todos** os alunos.
* **Regra de Ordenação:** Critério para geração da lista de chamada:
  * Alfabética ou Anti-alfabética por Nome de Guerra.
  * Alfabética ou Anti-alfabética por Nome Completo.
  * Alfabética ou Anti-alfabética por Número de Matrícula.
* **Alunos por Ano:** Quantidade de alunos de cada ano que deverão ser escalados em cada dia.

### Endpoints da API (Funcionalidade F2)

* **GET /escalas:** Retorna a lista de todas as configurações de escala cadastradas.
* **POST /escalas:** Registra uma nova configuração de escala e suas regras de ordenação.
* **DELETE /escalas/:id:** Remove uma configuração de escala do sistema através do seu ID único.

## Funcionalidade F3: Geração Automática da Escala e Aditamento

A Funcionalidade F3 é o núcleo automatizado do sistema. Ela cruza as parametrizações definidas na configuração de escalas (F2) com a lista de alunos ativos (F1) para distribuir, de forma inteligente e justa, os serviços da semana seguinte, além de automatizar a parte burocrática de comunicação.
<img width="1596" height="874" alt="Captura de tela 2026-06-01 163738" src="https://github.com/user-attachments/assets/fafc4816-2024-4e9b-a69b-2c828b0fc718" />


### Características e Regras de Negócio

* **Visualização e Geração Flexível:** A interface permite que o utilizador selecione quais escalas deseja executar simultaneamente (ex: uma Escala Preta para dias úteis e uma Escala Vermelha para o fim de semana) e exibe o resultado visualmente num calendário de 7 dias.
* **Regra de Descanso Regulamentar (48h):** O algoritmo de distribuição possui um controlo de folgas. Antes de escalar um aluno, o sistema rastreia o último serviço prestado através do número de matrícula e garante que o militar tenha um intervalo de descanso mínimo de 48 horas (não podendo ser escalado caso tenha tirado serviço no dia anterior ou no dia anterior a este).
* **Normalização de Documentos:** Para evitar inconsistências no aditamento, o sistema aplica um filtro que remove os acentos de forma automatizada única e exclusivamente do Nome Completo do militar, preservando a integridade das outras informações.
* **Geração de Documento Oficial:** O sistema compila o cronograma gerado e constrói de forma nativa um documento em PDF formatado como "Aditamento ao Boletim Interno".
* **Notificação Automatizada:** Com um único clique, o sistema anexa o PDF gerado e dispara e-mails automáticos para o Comandante de Companhia, o Sargenteante e demais instâncias de gestão definidas.

### Endpoints da API (Funcionalidade F3)

* **POST `/escalas/gerar`:** Recebe os identificadores das escalas selecionadas no frontend, executa o algoritmo de distribuição (aplicando ordenação, filtro de segmento e regra de 48h de descanso) e persiste a escala gerada na base de dados.
* **GET `/escalas/pdf`:** Consulta a escala ativa gerada na base de dados e realiza o streaming de um ficheiro `.pdf` gerado em tempo real com o aditamento.
* **POST `/escalas/enviar`:** Renderiza o cronograma em PDF na memória do servidor e utiliza o serviço SMTP para encaminhar o ficheiro anexado via e-mail aos militares responsáveis.

## 📱 MVP Mobile (React Native)

O sistema **Auto Escala** conta com um aplicativo móvel desenvolvido em **React Native**. O objetivo deste módulo é oferecer agilidade no gerenciamento de efetivo, permitindo que cadastros e consultas sejam feitos de qualquer lugar via rede local.

### 🛠️ Tecnologias Mobile
* **Framework:** React Native (via Expo)
* **Ícones:** Material Community Icons (@expo/vector-icons)
* **Cliente HTTP:** Axios (integração com a API Node.js na porta 3000)
* **Estilização:** StyleSheet (UI inspirada no layout administrativo do projeto)

## Como Executar o Mobile

### Pre-requisitos
* Possuir o Node.js instalado.
* Instalar o aplicativo Expo Go no celular (Android ou iOS).
* Certificar-se de que o computador e o celular estao conectados na mesma rede Wi-Fi.

### 1. Configurar o IP da API
Para o celular encontrar o servidor, voce deve editar o arquivo `mobile/src/services/api.js` com o IP da sua maquina:
```javascript
// mobile/src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Substitua pelo IP que aparece no terminal do Expo (Metro) e a porta 3000 do servidor
  baseURL: '[http://192.168.1.102:3000](http://192.168.1.102:3000)', 
});

export default api;
```

### 2. Iniciar o Aplicativo
Navegue ate a pasta mobile, instale as dependencias e inicie o Metro Bundler:
```bash
cd mobile
npm install
npx expo start
```
Escaneie o QR Code gerado no terminal com a camera do seu celular ou atraves do app Expo Go.

## Funcionalidade F1: Cadastro de Alunos (Mobile)
A versao mobile implementa o ciclo completo de gerenciamento da funcionalidade F1 com foco em usabilidade (UX).
<img width="720" height="1600" alt="WhatsApp Image 2026-06-01 at 20 31 34 (1)" src="https://github.com/user-attachments/assets/ba3d1e51-566f-4064-b55a-7bfbe0334208" />
<img width="720" height="1600" alt="WhatsApp Image 2026-06-01 at 20 31 34" src="https://github.com/user-attachments/assets/7094ad5e-79dc-4e06-9af7-fb3724de2c2b" />


### Recursos Implementados
* **CRUD Completo**: Cadastro, listagem, edicao e exclusao de alunos integrados ao banco de dados MySQL.
* **Interface Otimizada**: Visual em Cards com separacao clara de informacoes e cabecalho dinamico conforme as regras de negocio.
* **Seletores Inteligentes**:
    * **Turma**: Escolha rapida de turma.
    * **Segmento**: Escolha rapida entre Masculino e Feminino.
    * **Saude**: Selecao binaria (Apto / Nao Apto) para evitar erros de digitacao e padronizar os dados.
    * **Funcao**: Seletor de status para indicar se o aluno possui funcao atribuida (Sim / Nao).
* **Integridade de Dados**: O campo Matricula é tratado como Chave Primaria, sendo editavel apenas no momento do cadastro para preservar a consistencia do banco de dados.

### Endpoints Consumidos (Mobile)
O aplicativo realiza requisicoes JSON para as seguintes rotas do backend configuradas no servidor:

* **GET /alunos**: Lista todos os militares cadastrados no sistema.
* **POST /alunos**: Registra um novo militar enviando os dados do formulario.
* **PUT /alunos/:matricula**: Atualiza as informacoes de um militar especifico atraves da sua chave primaria.
* **DELETE /alunos/:matricula**: Remove o registro do militar permanentemente do banco de dados.
