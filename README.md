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
  - Função (ex: sargenteante)
  - Estado de saúde
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
  - Cinza: dias úteis (segunda a sexta)
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

### Sistema de Dispensa (Baixados)
- Registro de alunos que estão dispensados de atividades.
- Login do aluno utilizando número de matrícula e senha.
- Preenchimento de formulário de dispensa contendo:
  - Motivo da dispensa
  - Tipo de atividade dispensada (formatura, serviço, TFM, etc.)
  - Data de validade da dispensa
  - Upload do documento oficial da dispensa (PDF)

### Área do Sargenteante
- Recebimento automático dos pedidos de dispensa enviados pelos alunos.
- Análise das informações e documentos enviados.
- Aprovação ou rejeição das dispensas.
- Atualização automática do status do aluno na escala.
- Remoção automática do aluno da escala durante o período de dispensa.
---

## Tecnologias Utilizadas

### Backend
- **Node.js 20**
- **Express**
- **MySQL2** (MySQL Connector)
- **Docker**

### Banco de Dados
- **MySQL 8**
- Executado via Docker

### Frontend
- **HTML5 & CSS3** (Layout responsivo e modais personalizados)
- **JavaScript (ES6+)**
- **Chart.js** (Gráficos)
- **FontAwesome** (Ícones)

### Infraestrutura
- **Docker**
- **Docker Compose**

---

## Estrutura do Projeto

```bash
grupo4-escalasvc/
│
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── Dockerfile
│
├── database/
│   └── (scripts SQL futuros)
│
└── docker-compose.yml

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
* Segmento (Masculino ou Feminino)
* Função
* Estado de Saúde
* E-mail Institucional
<img width="1874" height="899" alt="image" src="https://github.com/user-attachments/assets/51bf3dd2-cdd3-4951-b932-0e93da45b6d9" />

## Tecnologias Utilizadas

* Frontend: React.js com Vite
* Backend: Node.js com Express
* Banco de Dados: MySQL 8.4
* Orquestração: Docker e Docker Compose

## Estrutura do Projeto

* /backend: API REST desenvolvida em Node.js.
* /frontend: Interface do usuário desenvolvida em React.
* /database: Scripts SQL para inicialização e estruturação do banco de dados.
* docker-compose.yml: Arquivo de configuração para subir todos os serviços simultaneamente.

## Como Executar o Projeto

### Pré-requisitos
* Docker instalado
* Docker Compose instalado

## Endpoints da API (Funcionalidade F1)
* GET /alunos: Lista todos os alunos cadastrados.

* POST /alunos: Cadastra um novo aluno.

* PUT /alunos/:matricula: Atualiza os dados de um aluno existente.

* DELETE /alunos/:matricula: Remove um aluno do sistema.
