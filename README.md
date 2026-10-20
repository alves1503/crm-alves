# Alves.CRM

CRM de atendimento via WhatsApp para organizar conversas e responder clientes em uma única interface. O projeto reúne um frontend em React e TypeScript, uma API Spring Boot e a integração de mensagens com a Evolution API.

> Projeto independente. Alves.CRM não é afiliado, patrocinado ou endossado pela WhatsApp/Meta nem pelos mantenedores da Evolution API.

> [!WARNING]
> **Este projeto não está pronto para produção sem uma avaliação e preparação adicionais.** O envio e o recebimento de mensagens dependem da Evolution API e da conexão de uma conta WhatsApp. A disponibilidade, compatibilidade e conformidade dessa integração não são garantidas pelo Alves.CRM nem pela Meta. Mudanças técnicas, desconexões, limitações ou medidas aplicadas à conta podem interromper o serviço. Avalie os termos atuais do WhatsApp/Meta e os riscos para sua operação antes de conectar uma conta real; prefira uma integração oficial da Meta quando precisar de suporte e garantias de uso em produção. Faça testes com uma conta não crítica e não use o projeto para dados sensíveis sem uma revisão de segurança, privacidade, backups e infraestrutura.

## Visão geral

- Inbox para acompanhar conversas e seus estados.
- Busca e filtragem de atendimentos.
- Histórico de mensagens recebidas e enviadas.
- Respostas enviadas pelo WhatsApp conectado.
- Assinatura de atendente nas mensagens enviadas pelo CRM.
- Encerramento de atendimento com mensagem configurável.
- Autenticação por e-mail e senha, com tokens JWT.
- Integração com WhatsApp por QR Code via Evolution API.
- Interface web responsiva.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Three.js, Lucide |
| Backend | Java 17, Spring Boot 3, Spring Security, JDBC, JWT |
| Banco do CRM | MySQL 8.4 |
| Integração WhatsApp | Evolution API 2.3.7 |
| Persistência da Evolution | PostgreSQL 15 e Redis 7 |
| Execução | Docker Compose |

O backend usa JDBC e SQL explícito, sem ORM. O esquema inicial fica em `backend/src/main/resources/schema.sql`.

## Requisitos

Para a forma recomendada de execução:

- Docker Desktop atualizado, incluindo Docker Compose v2.
- Git para clonar o repositório.
- Conexão com a internet para baixar as imagens e dependências.

Para desenvolvimento fora do Docker:

- Java 17 ou superior.
- Maven 3.9 ou superior.
- Node.js 20 ou superior e npm.

## Início rápido com Docker

Na página do repositório no GitHub, clique em **Code** e copie a URL HTTPS. Use-a no comando abaixo e entre na pasta clonada:

```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_REPOSITORIO>
```

Crie o arquivo local de ambiente a partir do exemplo.

**PowerShell:**

```powershell
Copy-Item .env.example .env
notepad .env
```

**Linux/macOS:**

```bash
cp .env.example .env
${EDITOR:-nano} .env
```

No `.env`, substitua **todos** os valores iniciados por `CHANGE_ME` por valores próprios. Não use os placeholders nem reutilize senhas de outros serviços. Requisitos importantes:

- `CRM_ADMIN_PASSWORD`: no mínimo 12 caracteres.
- `JWT_SECRET`: no mínimo 32 bytes; use uma chave aleatória.
- `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `EVOLUTION_API_KEY`, `EVOLUTION_WEBHOOK_SECRET` e `EVOLUTION_DB_PASSWORD`: escolha valores fortes e exclusivos.
- `CRM_ADMIN_EMAIL`: e-mail usado para o primeiro acesso.

Para gerar uma chave hexadecimal aleatória de 32 bytes no PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $rng.GetBytes($bytes)
  [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
} finally {
  $rng.Dispose()
}
```

Execute o comando novamente para cada segredo. No Linux/macOS, pode-se usar `openssl rand -hex 32`.

Suba os serviços:

```bash
docker compose up --build -d
docker compose ps
```

Na primeira execução, a construção das imagens e a inicialização dos bancos podem levar alguns minutos. Acompanhe a inicialização com:

```bash
docker compose logs -f backend
```

Quando os serviços estiverem prontos:

| Serviço | Endereço local |
| --- | --- |
| Alves.CRM | [http://localhost:3000](http://localhost:3000) |
| API | [http://localhost:8080](http://localhost:8080) |
| Swagger UI | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) |
| OpenAPI JSON | [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs) |
| Evolution API | [http://localhost:8081](http://localhost:8081) |

O Swagger UI documenta e permite explorar os endpoints da API; o JSON OpenAPI pode ser usado para gerar clientes e tipos. Esses endereços são locais. O MySQL também publica a porta `3306` para desenvolvimento local. Não exponha documentação interativa, portas de banco de dados ou serviços administrativos à internet sem controles de acesso e configuração apropriados.

### Primeiro acesso e conexão do WhatsApp

1. Abra o CRM em `http://localhost:3000`.
2. Entre com `CRM_ADMIN_EMAIL` e `CRM_ADMIN_PASSWORD` definidos no `.env`.
3. A API cria o usuário administrador na primeira inicialização, se aquele e-mail ainda não existir. A senha é armazenada com BCrypt.
4. No CRM, solicite o QR Code da conexão do WhatsApp.
5. No telefone, abra **WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho** e escaneie o QR Code.
6. Aguarde a confirmação da conexão no CRM.

O telefone e a instância precisam permanecer conectados à Evolution API para envio e recebimento de mensagens. A Evolution encaminha eventos de mensagens ao webhook configurado no Compose.

> Alterar `CRM_ADMIN_PASSWORD` depois que o administrador já foi criado não troca a senha existente. A variável é usada pelo bootstrap para criar a conta quando ela ainda não existe.

### Parar, atualizar e remover os dados

Parar os serviços sem apagar dados:

```bash
docker compose down
```

Reconstruir e atualizar o frontend e o backend:

```bash
docker compose up -d --build frontend backend
```

Os dados do MySQL e da Evolution ficam em volumes nomeados. **`docker compose down -v` apaga esses volumes e os dados persistidos**; use somente se realmente quiser descartá-los. Fazer backup antes de atualizações ou migrações.

Se já existir um volume MySQL de uma instalação anterior, mudar `MYSQL_DATABASE` ou `MYSQL_USER` no `.env` não renomeia nem migra o banco existente automaticamente.

## Configuração

O `.env.example` contém somente placeholders não funcionais. Todas as credenciais precisam ser personalizadas no `.env`, que é ignorado pelo Git.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `MYSQL_DATABASE` | Sim | Nome do banco do CRM. |
| `MYSQL_USER` | Sim | Usuário do MySQL para a API. |
| `MYSQL_PASSWORD` | Sim | Senha do usuário do MySQL. |
| `MYSQL_ROOT_PASSWORD` | Sim | Senha administrativa do MySQL. |
| `JWT_SECRET` | Sim | Chave usada para assinar tokens JWT; pelo menos 32 bytes. |
| `JWT_TOKEN_HOURS` | Não | Validade do token em horas. Padrão: `12`. |
| `CRM_ADMIN_EMAIL` | Sim | E-mail da conta administrativa inicial. |
| `CRM_ADMIN_PASSWORD` | Sim | Senha da conta inicial; mínimo de 12 caracteres. |
| `EVOLUTION_API_KEY` | Sim | Chave de autenticação da Evolution API. |
| `EVOLUTION_INSTANCE` | Não | Nome da instância WhatsApp. Padrão: `suporte`. |
| `EVOLUTION_WEBHOOK_SECRET` | Sim | Segredo verificado pelo webhook do backend. |
| `CRM_CLOSED_MESSAGE` | Não | Texto enviado ao encerrar um atendimento. |
| `EVOLUTION_DB_PASSWORD` | Sim | Senha do PostgreSQL usado pela Evolution API. |

No Compose, os endereços entre containers são configurados automaticamente. Para execução local do backend fora do Docker, a URL do MySQL e `EVOLUTION_API_URL` devem apontar para os serviços locais, conforme os passos de desenvolvimento abaixo.

## Desenvolvimento

O Docker Compose é a forma mais simples de iniciar todas as dependências. Para desenvolver o frontend com o servidor Vite e manter os serviços auxiliares no Docker:

```bash
docker compose up -d mysql evolution-db evolution-redis evolution backend
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`. O Vite encaminha requisições `/api` para `http://localhost:8080`.

### Backend local

Com Java 17+ e Maven 3.9+, e o `.env` configurado, carregue as variáveis no processo do PowerShell. Execute a partir da raiz do projeto:

```powershell
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
  }
}
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/$env:MYSQL_DATABASE?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME = $env:MYSQL_USER
$env:SPRING_DATASOURCE_PASSWORD = $env:MYSQL_PASSWORD
$env:EVOLUTION_API_URL = "http://localhost:8081"
docker compose up -d mysql evolution-db evolution-redis evolution
Set-Location backend
mvn spring-boot:run
```

O Spring Boot não carrega `.env` automaticamente. Não imprima nem compartilhe o conteúdo desse arquivo em logs, capturas de tela ou issues.

### Frontend

Com Node.js 20+ e npm, execute na pasta `frontend`:

```bash
npm ci
npm run dev
```

Comandos úteis:

```bash
npm run build       # Verifica os tipos TypeScript e gera o build de produção
npm run api:types   # Atualiza os tipos a partir do OpenAPI local
```

Para regenerar os tipos, a API precisa estar rodando em `http://localhost:8080`.

### Testes

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm run build
```

O build do backend usado pelo Dockerfile não executa testes (`-DskipTests`); rode `mvn test` separadamente quando necessário.

## Estrutura do projeto

```text
.
├── backend/
│   ├── src/main/java/com/alvescrm/
│   │   ├── auth/          # Autenticação, JWT e bootstrap do administrador
│   │   ├── conversation/  # Conversas, mensagens e status
│   │   ├── shared/        # Tratamento e contratos de erro compartilhados
│   │   └── whatsapp/      # Evolution API, QR Code e webhook
│   └── src/main/resources/
│       ├── application.yml
│       └── schema.sql
├── frontend/
│   └── src/
│       ├── api/           # Tipos gerados do OpenAPI
│       ├── components/
│       ├── pages/
│       └── services/
├── docker-compose.yml
├── .env.example
└── README.md
```

## API

O projeto inclui documentação Swagger/OpenAPI servida pelo backend:

- **Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
- **Especificação OpenAPI (JSON):** `http://localhost:8080/v3/api-docs`

O Swagger UI permite consultar os contratos e experimentar as operações da API durante o desenvolvimento. Em qualquer implantação acessível pela internet, restrinja ou desative a interface e proteja a especificação conforme a política de segurança do ambiente. As rotas do CRM exigem o cabeçalho `Authorization: Bearer SEU_TOKEN_JWT`, exceto login e webhook.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Autentica e emite um JWT. |
| `GET` | `/api/auth/me` | Retorna o usuário autenticado. |
| `GET` | `/api/conversations` | Lista conversas; aceita `search` e `status`. |
| `GET` | `/api/conversations/{id}` | Consulta uma conversa. |
| `GET` | `/api/conversations/{id}/messages` | Lista mensagens da conversa. |
| `POST` | `/api/conversations/{id}/messages` | Envia uma mensagem pelo WhatsApp. |
| `PATCH` | `/api/conversations/{id}/status` | Atualiza o status da conversa. |
| `GET` | `/api/whatsapp/status` | Consulta o estado da conexão. |
| `GET` | `/api/whatsapp/qr` | Obtém o QR Code de pareamento. |
| `POST` | `/api/webhooks/evolution` | Recebe eventos autenticados da Evolution API. |

Status de conversa disponíveis: `OPEN`, `IN_PROGRESS`, `WAITING` e `CLOSED`. Ao mudar para `CLOSED`, a API envia `CRM_CLOSED_MESSAGE`; a conversa só é encerrada se a Evolution aceitar o envio.

Exemplo de login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SUA_SENHA_CONFIGURADA"}'
```

Use a senha que você configurou no `.env`; não coloque credenciais reais em scripts, documentação pública ou histórico Git.

## Solução de problemas

### O backend fica em `Restarting`

Veja o motivo nos logs:

```bash
docker compose logs --tail=150 backend
```

Verifique se todos os placeholders foram trocados, se `CRM_ADMIN_PASSWORD` tem pelo menos 12 caracteres e se `JWT_SECRET` tem pelo menos 32 bytes. Confirme também que MySQL e Evolution aparecem como saudáveis em `docker compose ps`.

### A API não conecta ao MySQL

No Docker, a API usa o nome do serviço `mysql`; não use `localhost` como host da conexão entre containers. Se o volume persistente foi inicializado com credenciais diferentes, alterar o `.env` não atualiza automaticamente as credenciais internas do banco. Faça backup e planeje uma migração antes de alterar ou recriar volumes.

### O QR Code não aparece ou o WhatsApp desconectou

Confira `docker compose logs --tail=150 evolution` e `docker compose logs --tail=150 backend`. Verifique a chave configurada, o estado da Evolution, a conexão do telefone e se o QR Code ainda está válido. Gere outro QR Code se necessário.

### Uma porta já está em uso

As portas padrão são `3000`, `3306`, `8080` e `8081`. Feche o processo que as utiliza ou altere os mapeamentos de porta em `docker-compose.yml`, atualizando também os endereços de acesso correspondentes.

### A senha do administrador configurada no `.env` não funciona

O bootstrap cria o administrador apenas se o e-mail ainda não existir. Alterar `CRM_ADMIN_PASSWORD` não redefine uma conta já armazenada no MySQL.

## Segurança e publicação

- **Não trate a configuração atual como pronta para produção.** Além de endurecer e revisar a infraestrutura, avalie cuidadosamente a dependência da Evolution API, as regras atuais da Meta/WhatsApp e o impacto de possíveis desconexões, mudanças incompatíveis ou restrições da conta.
- A integração Evolution/WhatsApp não fornece, por este projeto, SLA, suporte oficial da Meta ou garantia de continuidade. Considere a WhatsApp Business Platform/API oficial se esses requisitos forem importantes para sua operação.
- Em produção, mantenha o Swagger UI e o OpenAPI restritos ou desativados quando não forem necessários; não os exponha publicamente por padrão.
- Nunca publique `.env`, tokens, senhas, chaves ou dados reais de clientes.
- `.env` está no `.gitignore`; mantenha-o assim.
- O `.env.example` deve conter apenas placeholders não funcionais.
- Se um segredo real já foi enviado ao GitHub, removê-lo de um commit novo não é suficiente: revogue e gere outro segredo, e considere o histórico do repositório exposto.
- Faça backup dos volumes antes de atualizações ou migrações.
- Esta configuração Compose é voltada a desenvolvimento e auto-hospedagem básica. Antes de qualquer exposição pública, faça revisão de segurança e configure TLS/HTTPS, firewall, backups, monitoramento, gestão de segredos e controle de acesso adequados.
- Respeite os termos e requisitos de privacidade aplicáveis ao WhatsApp/Meta, à Evolution API e aos dados de seus usuários.

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo [`LICENSE`](./LICENSE).

As marcas e tecnologias de terceiros pertencem aos respectivos titulares.
