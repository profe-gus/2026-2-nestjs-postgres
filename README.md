# Computación en Internet 3 — NestJS + PostgreSQL

Proyecto base para las prácticas del curso **Computación en Internet 3**. Es una API REST construida con [NestJS](https://nestjs.com/) que se conecta a una base de datos **PostgreSQL** usando **TypeORM**.

Este repositorio sirve como punto de partida: trae la configuración inicial (conexión a la base de datos, validaciones globales, prefijo de rutas) y tres módulos:

- **`student`**: entidades `Student` y `Grades` (relacionadas 1:N), DTOs de creación, actualización y paginación, y el CRUD completo: crear, listar, buscar, actualizar (con transacción) y eliminar.
- **`user`**: registro e inicio de sesión de usuarios con contraseñas encriptadas (`bcrypt`) y autenticación con **JWT** (`passport-jwt`), más un *guard* de roles y decoradores propios (`@Auth()`, `@GetUser()`, `@RoleProtected()`) para proteger rutas.
- **`seed`**: un endpoint que borra los estudiantes y vuelve a cargar datos de prueba.

## Stack y dependencias

### Dependencias de producción

| Paquete | Versión | Para qué sirve |
|---|---|---|
| `@nestjs/common` | ^11.0.1 | Decoradores y utilidades base de Nest (`@Module`, `@Controller`, `@Injectable`, pipes, etc.) |
| `@nestjs/core` | ^11.0.1 | Núcleo del framework: arranque de la aplicación, inyección de dependencias |
| `@nestjs/platform-express` | ^11.0.1 | Adaptador HTTP: hace que Nest corra sobre Express por debajo |
| `@nestjs/config` | ^12.0.0 | Carga variables de entorno desde `.env` (`ConfigModule`) |
| `@nestjs/typeorm` | ^12.0.1 | Integra TypeORM como ORM dentro de Nest (`TypeOrmModule`) |
| `typeorm` | ^1.1.1 | ORM: mapea clases TypeScript (entidades) a tablas de la base de datos |
| `pg` | ^8.23.0 | Driver de PostgreSQL que usa TypeORM para conectarse |
| `@nestjs/passport` | ^12.0.0 | Integra Passport en Nest: `PassportModule`, `PassportStrategy` y el guard `AuthGuard()` |
| `passport` | ^0.7.0 | Librería de autenticación sobre la que corre `@nestjs/passport` |
| `passport-jwt` | ^4.0.1 | Estrategia de Passport que lee y valida el JWT que llega en el header `Authorization: Bearer <token>` |
| `@nestjs/jwt` | ^12.0.2 | `JwtModule`/`JwtService`: firma (genera) los tokens JWT |
| `bcrypt` | ^6.0.0 | Encripta (hash) las contraseñas antes de guardarlas y las compara en el login |
| `@types/bcrypt`, `@types/passport-jwt` | ^6.0.0 / ^4.0.1 | Tipos de TypeScript para `bcrypt` y `passport-jwt` (están en `dependencies`, aunque bien podrían ir en `devDependencies`) |
| `class-validator` | ^0.15.1 | Valida los DTOs (`@IsString()`, `@IsInt()`, etc.) |
| `class-transformer` | ^0.5.1 | Transforma objetos planos (JSON de las peticiones) en instancias de clases (DTOs) |
| `@nestjs/mapped-types` | * | Utilidades para derivar DTOs (`PartialType`, `PickType`) sin repetir código, típico en `update-*.dto.ts` |
| `reflect-metadata` | ^0.2.2 | Requerido por los decoradores de TypeScript (metadata en tiempo de ejecución) |
| `rxjs` | ^7.8.1 | Programación reactiva; Nest la usa internamente (interceptores, streams) |

### Dependencias de desarrollo

| Paquete | Para qué sirve |
|---|---|
| `@nestjs/cli` | Comandos `nest ...` (build, generate, start) |
| `@nestjs/schematics` | Generadores de código (`nest g module/controller/service`) |
| `@nestjs/testing` | Utilidades para escribir tests de Nest |
| `jest`, `ts-jest`, `@types/jest` | Framework y soporte de TypeScript para pruebas unitarias |
| `supertest`, `@types/supertest` | Pruebas de integración/e2e sobre HTTP |
| `typescript`, `ts-node`, `tsconfig-paths` | Compilación y ejecución de TypeScript |
| `eslint`, `typescript-eslint`, `eslint-config-prettier`, `eslint-plugin-prettier`, `@eslint/js`, `@eslint/eslintrc`, `globals` | Linting del código |
| `prettier` | Formateo automático del código |
| `ts-loader` | Loader de TypeScript (usado por el build de Nest) |
| `source-map-support` | Mapea errores en tiempo de ejecución de vuelta al código TypeScript original |
| `@types/express`, `@types/node` | Tipos de TypeScript para Express y Node |

## Estructura del proyecto

```
src/
├── main.ts                     # Punto de entrada: arranca la app, prefijo global, validaciones
├── app.module.ts                # Módulo raíz: config, conexión a la BD, módulos de features
├── student/
│   ├── student.module.ts        # Módulo de la feature "student" (registra Student y Grades con TypeOrmModule.forFeature)
│   ├── student.controller.ts    # Rutas HTTP de "student": crear, listar, buscar, actualizar, eliminar
│   ├── student.service.ts       # Lógica de negocio de "student"
│   ├── dto/
│   │   ├── create-student.dto.ts  # Reglas de validación para crear un student (incluye sus grades)
│   │   ├── update-student.dto.ts  # DTO de actualización: PartialType(CreateStudent), todos los campos opcionales
│   │   └── pagination.dto.ts      # Query params `limit`/`skip` para paginar el listado
│   └── entities/
│       ├── student.entity.ts      # Entidad TypeORM: tabla "student"
│       └── grades.entity.ts       # Entidad TypeORM: tabla "grades" (relación N:1 con student)
├── user/
│   ├── user.module.ts           # Registra User, PassportModule y JwtModule (secreto desde JWT_SECRET, expira en 1h)
│   ├── user.controller.ts       # Rutas: signup, auth (login) y una ruta privada de prueba
│   ├── user.service.ts          # Registro (hash con bcrypt), login y generación del JWT
│   ├── dto/
│   │   ├── register.dto.ts        # email, password (8–16 caracteres) y fullName
│   │   └── login.dto.ts           # email y password
│   ├── entities/
│   │   └── user.entity.ts         # Entidad TypeORM: tabla "user" (email único, isActive, roles)
│   ├── enums/
│   │   └── valid-roles.enum.ts    # Roles válidos: admin, teacher, super-user
│   ├── interfaces/
│   │   └── jwt.interface.ts       # Forma del payload del JWT: { id, email }
│   ├── strategies/
│   │   └── jwt.strategy.ts        # Valida el token y deja el usuario en request.user
│   ├── guards/
│   │   └── user-role/
│   │       └── user-role.guard.ts # Guard que verifica que el usuario tenga alguno de los roles requeridos
│   └── decorators/
│       ├── auth.decorator.ts      # @Auth(...roles): agrupa RoleProtected + los guards de autenticación y roles
│       ├── get-user.decorator.ts  # @GetUser(): extrae el usuario autenticado de la request
│       ├── test.decorator.ts      # @Test(): decorador de parámetro de ejemplo (solo imprime la request)
│       └── role-protected/
│           └── role-protected.decorator.ts  # @RoleProtected(...roles): guarda los roles como metadata
└── seed/
    ├── seed.module.ts           # Importa StudentModule para reutilizar StudentService
    ├── seed.controller.ts       # GET /api/seed
    ├── seed.service.ts          # Borra todos los estudiantes e inserta los datos de prueba
    └── data/
        └── seed-student.data.ts   # 40 estudiantes de ejemplo con sus notas
test/
└── app.e2e-spec.ts              # Prueba end-to-end de ejemplo
```

Cada nueva funcionalidad del curso debería seguir este mismo patrón: una carpeta por *feature*, con su `module`, `controller`, `service` y, cuando aplique, `dto/` y `entities/`.

## Requisitos previos

- **Node.js** 18 o superior
- **npm**
- **PostgreSQL** corriendo localmente (o accesible por red), con una base de datos ya creada

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` en la raíz del proyecto con las credenciales de tu base de datos:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=compunet3
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password
   JWT_SECRET=una_cadena_larga_y_secreta
   ```

   `JWT_SECRET` es la clave con la que se firman y verifican los tokens JWT. Sin ella la app no puede generar ni validar tokens.

   > El `.env` está en `.gitignore`: cada quien usa el suyo y **no se sube al repositorio**.

3. Levantar la aplicación en modo desarrollo (con recarga automática):

   ```bash
   npm run start:dev
   ```

4. (Opcional) Cargar datos de prueba llamando a `GET http://localhost:9000/api/seed`.

5. La API queda disponible en `http://localhost:9000/api` (ver [Puntos clave](#puntos-clave) sobre el prefijo global y [Endpoints disponibles](#endpoints-disponibles)).

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run start` | Levanta la app una vez (sin watch) |
| `npm run start:dev` | Levanta la app en modo watch (recarga en cada cambio) |
| `npm run start:debug` | Igual que `start:dev`, con el debugger de Node habilitado |
| `npm run start:prod` | Ejecuta el build ya compilado (`dist/main.js`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run lint` | Corre ESLint y corrige automáticamente lo que pueda |
| `npm run format` | Formatea el código con Prettier |
| `npm run test` | Corre las pruebas unitarias con Jest |
| `npm run test:watch` | Pruebas unitarias en modo watch |
| `npm run test:cov` | Pruebas unitarias con reporte de cobertura |
| `npm run test:e2e` | Corre las pruebas end-to-end |

## Comandos del CLI de Nest

El [Nest CLI](https://docs.nestjs.com/cli/overview) (`nest`, instalado como dependencia de desarrollo) sirve para generar código y gestionar el proyecto sin escribir todo el boilerplate a mano. Se ejecuta con `npx nest <comando>` (o directamente `nest <comando>` si lo tienen instalado global con `npm i -g @nestjs/cli`).

| Comando | Alias | Qué hace |
|---|---|---|
| `nest new <nombre>` | `nest n` | Crea un proyecto Nest nuevo desde cero |
| `nest generate module <nombre>` | `nest g mo` | Genera un módulo (`*.module.ts`) y lo registra en el módulo padre |
| `nest generate controller <nombre>` | `nest g co` | Genera un controlador (`*.controller.ts`) con su spec de test |
| `nest generate service <nombre>` | `nest g s` | Genera un servicio (`*.service.ts`) con su spec de test |
| `nest generate resource <nombre>` | `nest g res` | Genera un CRUD completo: módulo, controlador, servicio, DTOs y entidad (pregunta el transport layer, ej. REST API) |
| `nest generate class <nombre>` | `nest g cl` | Genera una clase simple (útil para DTOs o entidades) |
| `nest generate interface <nombre>` | `nest g interface` | Genera una interfaz de TypeScript |
| `nest generate pipe <nombre>` | `nest g pi` | Genera un pipe (para validación/transformación de datos) |
| `nest generate guard <nombre>` | `nest g gu` | Genera un guard (para autenticación/autorización de rutas) |
| `nest generate interceptor <nombre>` | `nest g in` | Genera un interceptor |
| `nest generate filter <nombre>` | `nest g f` | Genera un filtro de excepciones |
| `nest build` | | Compila el proyecto a `dist/` (equivalente a `npm run build`) |
| `nest start` | | Levanta la aplicación (equivalente a `npm run start`) |
| `nest start --watch` | | Levanta la aplicación en modo watch (equivalente a `npm run start:dev`) |
| `nest info` | `nest i` | Muestra las versiones de Node, npm y de los paquetes `@nestjs/*` instalados |

> Tip: se puede indicar la carpeta destino del recurso generado, por ejemplo `nest g mo course` crea `src/course/course.module.ts`. Así es como se generó la estructura de `src/student/`.

## Endpoints disponibles

Todas las rutas quedan bajo el prefijo global `/api` (definido en `main.ts`), más el prefijo de cada controlador (`student`, `user`, `seed`).

### Student

| Método | Ruta | Descripción | Body / Query params |
|---|---|---|---|
| `POST` | `/api/student` | Crea un estudiante (opcionalmente con sus notas) | `{ name, age, email, isActive, gender, favoriteSubjects?, grades? }` |
| `GET` | `/api/student` | Lista estudiantes, paginado | Query: `limit?` (cantidad), `skip?` (offset) |
| `GET` | `/api/student/:term` | Busca un estudiante por `id` (UUID), por `name` o por `nickname` | — |
| `PATCH` | `/api/student/:id` | Actualiza un estudiante por `id`. Si se envía `grades`, **reemplaza** todas sus notas | Cualquier subconjunto de los campos de creación |
| `DELETE` | `/api/student/:id` | Elimina un estudiante (y sus notas, por el `onDelete: "CASCADE"`) | — |

Ejemplos de request:

```bash
# Crear un estudiante con sus notas
curl -X POST http://localhost:9000/api/student \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Pérez",
    "age": 21,
    "email": "ana@example.com",
    "isActive": true,
    "gender": "Female",
    "favoriteSubjects": ["Math", "History"],
    "grades": [
      { "subject": "Math", "grade": 90 },
      { "subject": "History", "grade": 85 }
    ]
  }'

# Listar (paginado)
curl "http://localhost:9000/api/student?limit=10&skip=0"

# Buscar por id, por nombre o por nickname
curl http://localhost:9000/api/student/<uuid>
curl http://localhost:9000/api/student/ana_perez21

# Actualizar (solo los campos enviados; si va "grades", reemplaza la lista completa)
curl -X PATCH http://localhost:9000/api/student/<uuid> \
  -H "Content-Type: application/json" \
  -d '{
    "age": 22,
    "grades": [
      { "subject": "Math", "grade": 95 },
      { "subject": "History", "grade": 85 },
      { "subject": "Physics", "grade": 80 }
    ]
  }'

# Eliminar
curl -X DELETE http://localhost:9000/api/student/<uuid>
```

### User (autenticación)

| Método | Ruta | Descripción | Body / Headers |
|---|---|---|---|
| `POST` | `/api/user/signup` | Registra un usuario. Devuelve el usuario (sin la contraseña) y un `token` | `{ email, password, fullName }` |
| `POST` | `/api/user/auth` | Inicia sesión. Devuelve `id`, `email` y un `token` nuevo | `{ email, password }` |
| `POST` | `/api/user/private` | Ruta protegida de prueba: solo responde si llega un token válido | Header `Authorization: Bearer <token>` |

```bash
# Registrarse
curl -X POST http://localhost:9000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{ "email": "profe@example.com", "password": "Secreta123", "fullName": "Profe Ejemplo" }'

# Iniciar sesión (copiar el "token" de la respuesta)
curl -X POST http://localhost:9000/api/user/auth \
  -H "Content-Type: application/json" \
  -d '{ "email": "profe@example.com", "password": "Secreta123" }'

# Llamar a la ruta protegida con el token
curl -X POST http://localhost:9000/api/user/private \
  -H "Authorization: Bearer <token>"
```

Sin token (o con uno vencido o inválido) la ruta privada responde `401 Unauthorized`. El token dura **1 hora**.

### Seed

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/seed` | **Borra todos los estudiantes** y vuelve a insertar los 40 de `src/seed/data/seed-student.data.ts`. Responde `SEED EXECUTED` |

> Ojo: el seed no está protegido y deja la tabla `student` solo con los datos de prueba. Úsenlo únicamente en su base de datos local.

También hay una **colección de Postman lista para importar** en [`postman/compunet3-nestjs-postgres.postman_collection.json`](postman/compunet3-nestjs-postgres.postman_collection.json) con las peticiones de crear, listar y buscar (ver [Colección de Postman](#colección-de-postman)).

## Colección de Postman

En [`postman/compunet3-nestjs-postgres.postman_collection.json`](postman/compunet3-nestjs-postgres.postman_collection.json) está la colección con las peticiones de "Crear estudiante", "Listar estudiantes (paginado)" y "Buscar estudiante (id, name o nickname)".

Para usarla:

1. Abrir Postman → **File → Import** → seleccionar el archivo.
2. La colección trae la variable `baseUrl` ya configurada en `http://localhost:9000/api` (ajustarla si cambian el puerto en `main.ts`).
3. Para "Buscar estudiante", completar la variable de colección `studentTerm` (o editar el valor directamente en la pestaña **Params** del request) con el `id`, `name` o `nickname` de un estudiante que ya hayan creado.
4. Con la app corriendo (`npm run start:dev`) y la base de datos disponible, ejecutar las peticiones en orden: primero crear, después listar/buscar.

La colección todavía no incluye los requests de actualizar (`PATCH`) y eliminar (`DELETE`) de estudiantes, ni los de `user` y `seed`: agréguenlos para mantenerla al día. Para las rutas protegidas, en la pestaña **Authorization** del request elijan **Bearer Token** y peguen el token del login.

## Guards y decoradores

Antes de ver cómo se protege la API, conviene tener claros estos dos conceptos.

### ¿Qué es un decorador?

Un **decorador** es una función que se escribe con `@` encima de una clase, un método, una propiedad o un parámetro, y le agrega comportamiento o información (*metadata*) sin cambiar su código. Nest está construido sobre decoradores: `@Controller()`, `@Get()`, `@Body()`, `@Injectable()`, `@Entity()` y `@Column()` son todos decoradores.

**Para qué sirven:** declarar *qué* es o *qué* necesita algo (esta clase es un controlador, este método responde a `GET`, este parámetro sale del `body`) y dejar que el framework se encargue del *cómo*. También se pueden crear decoradores propios para no repetir código. En este proyecto hay tres tipos:

- **De parámetro** (`createParamDecorator`): `@GetUser()` saca el usuario autenticado de `request.user` y lo entrega directamente como argumento del método. Con `@GetUser('email')` devuelve solo ese campo.
- **De metadata** (`SetMetadata`): `@RoleProtected('admin')` no ejecuta nada en la petición; solo "pega" la lista de roles al método para que un guard la lea después.
- **Compuestos** (`applyDecorators`): `@Auth(...roles)` junta varios decoradores en uno solo. Escribir `@Auth(ValidRoles.admin)` equivale a escribir `@RoleProtected(ValidRoles.admin)` y `@UseGuards(AuthGuard(), UserRoleGuard)`.

### ¿Qué es un guard?

Un **guard** es una clase con `@Injectable()` que implementa `CanActivate`. Nest la ejecuta **antes** de llegar al método del controlador, y su método `canActivate()` decide si la petición sigue (`true`) o se corta (`false` o lanzando una excepción como `UnauthorizedException` o `ForbiddenException`). Se aplican con `@UseGuards()` a un método, a un controlador entero o de forma global.

**Para qué sirven:** autenticación y autorización, es decir, responder "¿quién eres?" y "¿tienes permiso para esto?" en un solo lugar, en vez de repetir esas validaciones dentro de cada controlador o servicio.

En este proyecto hay dos:

- **`AuthGuard()`** (de `@nestjs/passport`): usa la estrategia `JwtStrategy` para leer el token del header `Authorization: Bearer <token>`, verificar su firma con `JWT_SECRET` y buscar el usuario en la base de datos. Si todo está bien, deja el usuario en `request.user`; si no, responde `401`.
- **`UserRoleGuard`** (`src/user/guards/user-role/user-role.guard.ts`): usa `Reflector` para leer los roles que dejó `@RoleProtected()` en el método. Si no hay roles requeridos, deja pasar a cualquier usuario autenticado; si los hay, verifica que `request.user.roles` tenga al menos uno, y si no responde `403 Forbidden`.

### Cómo trabajan juntos

```
Petición → AuthGuard() ──(token válido, request.user = usuario)──→ UserRoleGuard ──(rol permitido)──→ método del controlador
              │                                                     │
              └─ 401 si no hay token o es inválido                   └─ 403 si el usuario no tiene el rol
```

Ejemplo de uso en un controlador:

```ts
@Get('reportes')
@Auth(ValidRoles.admin, ValidRoles.teacher) // solo usuarios con rol admin o teacher
verReportes(@GetUser() user: User) {        // user llega listo, ya validado
  return `Hola ${user.fullName}`;
}
```

`@Auth()` sin argumentos (como en `POST /api/user/private`) solo exige estar autenticado, sin importar el rol.

## Puntos clave

Estos son los conceptos importantes que se están usando en este proyecto y que van a reutilizar durante el curso:

- **Módulos (`@Module`)**: Nest organiza la app en módulos. `AppModule` es el módulo raíz y va importando los módulos de cada feature (como `StudentModule`). Cada feature nueva del curso debe crear su propio módulo y registrarse en `imports` de `AppModule`.

- **Inyección de dependencias**: las clases marcadas con `@Injectable()` (como `StudentService`) se inyectan por constructor donde se necesiten (por ejemplo, en `StudentController`). Nest se encarga de crear e inyectar esas instancias, no hay que hacerlo a mano.

- **Conexión a PostgreSQL con TypeORM** (`src/app.module.ts`): `TypeOrmModule.forRoot()` configura la conexión leyendo las variables de entorno cargadas por `ConfigModule`. El puerto se lee con `port: +process.env.DB_PORT!`: las variables de entorno siempre llegan como string, así que el `+` las convierte a número, y el `!` al final (*non-null assertion* de TypeScript) le indica al compilador que la variable sí viene definida. Ojo con el orden: `+!process.env.DB_PORT` (con el `!` adelante) sería el operador de negación de JavaScript, que convierte `"5432"` en `false` y luego en `0`. `autoLoadEntities: true` hace que TypeORM detecte automáticamente las entidades registradas en cada módulo, sin tener que listarlas todas a mano.

- **`synchronize: true`**: hace que TypeORM cree/actualice las tablas automáticamente a partir de las entidades, sin necesidad de escribir migraciones. Es muy cómodo para aprender y prototipar, **pero nunca debe usarse en producción** (puede borrar o alterar datos reales). El propio código lo marca con un comentario recordándolo.

- **`ValidationPipe` global** (`src/main.ts`): valida automáticamente el `body` de las peticiones contra los DTOs usando `class-validator`.
  - `whitelist: true`: elimina del `body` cualquier propiedad que no esté declarada en el DTO.
  - `forbidNonWhitelisted: true`: si llega una propiedad no declarada, la petición falla con un error 400 en lugar de ignorarla silenciosamente.

- **Prefijo global de rutas** (`app.setGlobalPrefix('api')` en `main.ts`): todas las rutas de la aplicación quedan bajo `/api`. Cada controlador agrega su propio prefijo encima (`@Controller('student')`), por eso la ruta final es `/api/student`. Al agregar nuevos módulos (por ejemplo `course`, `enrollment`) solo hace falta definir el `@Controller('course')` correspondiente; el `/api` ya queda cubierto por el prefijo global.

- **DTOs + `class-validator`/`class-transformer`**: los DTOs (`create-*.dto.ts`, `update-*.dto.ts`) son las clases que definen la forma y las reglas de validación de los datos que entran por la API. `CreateStudent` (`src/student/dto/create-student.dto.ts`) valida `name`, `age`, `email`, `isActive`, `gender` (`@IsIn(['Male', 'Female', 'Other'])`) y, de forma opcional, `favoriteSubjects` y `grades`. `@nestjs/mapped-types` (`PartialType`) permite crear el DTO de actualización reutilizando el de creación, sin duplicar campos: `UpdateStudentDto` (`src/student/dto/update-student.dto.ts`) es `PartialType(CreateStudent)`, así que tiene las mismas reglas de validación pero todos los campos son opcionales.

- **Entidades TypeORM** (`src/student/entities/student.entity.ts`): la clase `Student`, decorada con `@Entity()`, define la tabla `student` en la base de datos. Cada `@Column()` es una columna (`name`, `age`, `email` con `unique: true`, `isActive`, `gender`, `favoriteSubjects` como `text` con `array: true`, `nickname`). `@PrimaryGeneratedColumn("uuid")` hace que el `id` se genere automáticamente como UUID.

- **Hooks de ciclo de vida (`@BeforeInsert` / `@BeforeUpdate`)**: en `Student`, antes de guardar o actualizar un registro, TypeORM ejecuta `checkNicknameInsert()` / `checkNicknameUpdate()`, que arman el `nickname` a partir del `name` y el `age` si no vino informado. Es un buen ejemplo de lógica que vive en la entidad en lugar del servicio.

- **Relación 1:N entre `Student` y `Grades`** (`src/student/entities/grades.entity.ts`): cada estudiante puede tener muchas notas (`subject` + `grade`). Se modela con `@OneToMany(() => Grades, grade => grade.student, { cascade: true, eager: true })` en `Student` y `@ManyToOne(() => Student, student => student.grades, { onDelete: "CASCADE" })` en `Grades`. `cascade: true` permite guardar las `grades` al mismo tiempo que el `student` (sin insertarlas aparte); `eager: true` hace que siempre se traigan las notas al consultar un estudiante, sin pedirlo explícitamente; `onDelete: "CASCADE"` borra las notas de un estudiante si el estudiante se elimina.

- **Repositorios con `TypeOrmModule.forFeature()` e `@InjectRepository()`**: `StudentModule` registra ambas entidades con `TypeOrmModule.forFeature([Student, Grades])`, lo que habilita inyectar sus repositorios en el servicio (`@InjectRepository(Student)`, `@InjectRepository(Grades)`). El repositorio (`.create()`, `.save()`, `.find()`, `.findOneBy()`, `createQueryBuilder()`, etc.) es la forma estándar de leer/escribir en la base de datos con TypeORM dentro de Nest.

- **Endpoint de creación** (`StudentController.create` → `StudentService.createStudent`): recibe el `body` ya validado como `CreateStudent`, separa las `grades` del resto de los datos, crea cada nota con `gradesRepository.create(...)` y arma el `student` con esas notas anidadas antes de guardar (`studentRepository.save(student)` persiste ambas entidades gracias al `cascade: true`).

- **Paginación con `PaginationDto`** (`GET /api/student`): `limit` y `skip` llegan como *query params*, es decir, como strings. `@Type(() => Number)` (de `class-transformer`) los convierte a número antes de validarlos con `@IsPositive()`/`@Min(0)`. El servicio los pasa directo a las opciones `take`/`skip` de `studentRepository.find()`.

- **Búsqueda flexible en `findOne`** (`GET /api/student/:term`): si el `term` es un UUID (`isUUID()` de `class-validator`) se busca por `id` con `findOneBy`; si no, se arma un `createQueryBuilder()` que compara `UPPER(name)` o `nickname` contra el término, y hace `leftJoinAndSelect("student.grades", ...)` para traer también sus notas.

- **Actualización con `preload`** (`PATCH /api/student/:id` → `StudentService.update`): `studentRepository.preload({ id, ...studentDetails })` busca el estudiante por `id` y le mezcla encima los campos que llegaron en el `body`, sin guardar todavía. Si no existe devuelve `undefined` y el servicio responde con `NotFoundException`.

- **Transacciones con `QueryRunner`** (`StudentService.update`): como actualizar un estudiante con notas implica varias operaciones (borrar las notas viejas y guardar el estudiante con las nuevas), se hacen dentro de una transacción: `datasource.createQueryRunner()` → `connect()` → `startTransaction()`, las operaciones con `queryRunner.manager`, y al final `commitTransaction()`. Si algo falla, `rollbackTransaction()` deshace todo, para no dejar un estudiante sin notas a medias. En ambos casos se llama `release()` para devolver la conexión al pool.

- **Las `grades` se reemplazan, no se agregan**: si el `body` del `PATCH` trae `grades`, el servicio borra **todas** las notas actuales del estudiante (`queryRunner.manager.delete(Grades, { student: { id } })`) y guarda solo las que vienen en la petición. Para agregar una materia nueva hay que enviar la lista completa (las anteriores más la nueva). Si el `body` no trae `grades`, las notas no se tocan.

- **Eliminación** (`DELETE /api/student/:id` → `StudentService.removeStudent`): busca el estudiante con `findOne` y lo borra con `studentRepository.remove(student)`. Sus notas se eliminan en la base de datos gracias al `onDelete: "CASCADE"` de la relación.

- **Usuarios y contraseñas** (`UserService.create`): la contraseña nunca se guarda en texto plano: `bcrypt.hashSync(password, 10)` la convierte en un hash antes de guardarla. En el login, `bcrypt.compareSync()` compara la contraseña recibida contra ese hash. Después de guardar se hace `delete user.password` para que la contraseña no viaje en la respuesta. Si el email o la contraseña no coinciden, se responde el mismo mensaje genérico (`Email or password incorrect`) para no revelar cuál de los dos falló.

- **Entidad `User`** (`src/user/entities/user.entity.ts`): `email` es único, `isActive` vale `true` por defecto y `roles` es un arreglo de texto que por defecto es `["teacher"]`. Un hook `@BeforeInsert`/`@BeforeUpdate` pasa el email a minúsculas y le quita espacios, para que `Ana@Mail.com` y `ana@mail.com` no cuenten como usuarios distintos.

- **JWT** (`UserModule` + `UserService.getJwtToken`): `JwtModule.registerAsync()` usa una `useFactory` con `ConfigService` para leer `JWT_SECRET` del `.env` cuando el módulo arranca. El token se firma con el payload `{ id, email }` (`JwtPayload`) y expira en 1 hora. Tanto el registro como el login devuelven un token.

- **`JwtStrategy`** (`src/user/strategies/jwt.strategy.ts`): extiende `PassportStrategy(Strategy)` de `passport-jwt`. En el constructor se le dice de dónde sacar el token (`ExtractJwt.fromAuthHeaderAsBearerToken()`) y con qué clave verificarlo. Su método `validate(payload)` se ejecuta solo si la firma es válida: busca el usuario por `id`, rechaza los inexistentes o inactivos y devuelve el usuario, que Passport deja en `request.user`. Ver [Guards y decoradores](#guards-y-decoradores) para cómo se usa.

- **Seed** (`SeedModule`): reutiliza `StudentService` (por eso `StudentModule` lo exporta en `exports`) para borrar todos los estudiantes con `deleteAllStudents()` y crear los de prueba en paralelo con `Promise.all`.

## ⚠️ Cosas a revisar (para practicar debugging)

- En `src/student/student.service.ts`, `handleException` **solo relanza el error si `error.code === '23505'`** (violación de `unique` en Postgres). Para cualquier otro error, el método registra el log y no hace `throw`: la función que llamó (`createStudent`, `findAll`, `findOne`) termina devolviendo `undefined` en silencio, en vez de propagar el fallo. Esto es especialmente delicado en `findOne`: el `throw new NotFoundException(...)` que se lanza explícitamente cuando no se encuentra el estudiante también es capturado por el mismo `catch`, pasa por `handleException` y, como no tiene `code === '23505'`, **se pierde** — el endpoint termina respondiendo distinto a un 404 real. Piensen cómo debería relanzar (`throw`) el error por defecto, y solo dar un manejo especial a los códigos de Postgres que les interese distinguir.

- Ese mismo `error.code === '23505'` se traduce hoy en un `InternalServerErrorException` (500). Una violación de `unique` (por ejemplo, un `email` repetido) es un error del cliente, no del servidor: ¿qué excepción de Nest (`BadRequestException`, `ConflictException`, etc.) describe mejor ese caso?

- En `src/student/entities/student.entity.ts`, `checkNicknameInsert`/`checkNicknameUpdate` arman el `nickname` con `this.nickname.toLowerCase().replace(" ", "_")`. `String.replace` con un string (no una expresión regular con `/g`) solo reemplaza la **primera** coincidencia, así que un nombre con varios espacios ("Ana María Pérez") no queda completamente convertido a `snake_case`. ¿Cómo lo arreglarían para que reemplace todos los espacios?

- `PATCH` con `grades` reemplaza todas las notas (ver [Puntos clave](#puntos-clave)). ¿Cómo cambiarían `update` para que una materia nueva se **agregue** y una que ya existe solo actualice su nota? Pista: si solo quitan el `delete`, TypeORM deja las notas que no están en el arreglo sin estudiante (`studentId` en `NULL`), así que hay que combinar las notas actuales con las nuevas.

- En `src/user/guards/user-role/user-role.guard.ts` hay un `import request from 'supertest'` que no se usa (dentro del método se declara otra variable `request` que lo tapa). `supertest` es una dependencia de **desarrollo**: si se instala la app solo con las dependencias de producción, ese import hace que la app no arranque. ¿Qué otros imports sin usar encuentran en `user.controller.ts` y el guard?

- `UserRoleGuard` lee los roles con `this.reflector.get(META_ROLES, context.getHandler())`, es decir, solo desde el **método**. Si alguien pone `@RoleProtected()` sobre el **controlador** completo, el guard no lo ve. ¿Qué método de `Reflector` (pista: `getAllAndOverride`) permitiría leerlo de ambos lugares?

- `UserService.handleException` tiene el mismo problema que el de `StudentService`: solo relanza el error `23505` (por ejemplo, registrarse con un email que ya existe), y además lo devuelve como `500`. Cualquier otro error deja a `create` devolviendo `undefined`.

- `GET /api/seed` borra datos y cualquiera puede llamarlo. ¿Cómo lo protegerían usando `@Auth(...)` para que solo un `admin` pueda ejecutarlo?

## Pruebas

```bash
# pruebas unitarias
npm run test

# pruebas end-to-end
npm run test:e2e

# cobertura
npm run test:cov
```

## Recursos del framework

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de TypeORM](https://typeorm.io)
- [class-validator](https://github.com/typestack/class-validator)
- [Guards en NestJS](https://docs.nestjs.com/guards)
- [Decoradores personalizados en NestJS](https://docs.nestjs.com/custom-decorators)
- [Autenticación con Passport en NestJS](https://docs.nestjs.com/recipes/passport)
