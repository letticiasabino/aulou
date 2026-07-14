import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";

const uuidParam = { type: "string", format: "uuid" } as const;
const pagination = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1 },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
  },
} as const;

const domainDocs: Record<string, Record<string, Record<string, unknown>>> = {
  "/v1/semesters": {
    get: {
      tags: ["semesters"],
      security: [{ bearerAuth: [] }],
      querystring: {
        ...pagination,
        properties: {
          ...pagination.properties,
          status: { type: "string", enum: ["planned", "active", "completed", "archived"] },
          includeArchived: { type: "boolean", default: false },
        },
      },
    },
    post: {
      tags: ["semesters"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["name", "startDate", "endDate"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1, maxLength: 160 },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          status: {
            type: "string",
            enum: ["planned", "active", "completed", "archived"],
            default: "planned",
          },
        },
      },
    },
  },
  "/v1/subjects": {
    get: {
      tags: ["subjects"],
      security: [{ bearerAuth: [] }],
      querystring: {
        ...pagination,
        properties: {
          ...pagination.properties,
          semesterId: uuidParam,
          status: { type: "string" },
          search: { type: "string" },
          includeArchived: { type: "boolean" },
        },
      },
    },
    post: {
      tags: ["subjects"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["semesterId", "name"],
        additionalProperties: false,
        properties: {
          semesterId: uuidParam,
          name: { type: "string", minLength: 1, maxLength: 160 },
          code: { type: "string", maxLength: 40 },
          description: { type: "string" },
          color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          workloadHours: { type: "number", minimum: 0 },
          status: {
            type: "string",
            enum: ["planned", "active", "completed", "dropped", "archived"],
          },
        },
      },
    },
  },
  "/v1/teachers": {
    get: { tags: ["teachers"], security: [{ bearerAuth: [] }], querystring: pagination },
    post: {
      tags: ["teachers"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1, maxLength: 160 },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          institution: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
  },
  "/v1/academic-events": {
    get: { tags: ["academic-events"], security: [{ bearerAuth: [] }], querystring: pagination },
    post: {
      tags: ["academic-events"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["title", "eventType", "startAt"],
        additionalProperties: false,
        properties: {
          semesterId: uuidParam,
          subjectId: uuidParam,
          title: { type: "string", minLength: 1, maxLength: 160 },
          description: { type: "string" },
          eventType: {
            type: "string",
            enum: [
              "exam",
              "assignment",
              "class",
              "deadline",
              "forum",
              "presentation",
              "meeting",
              "study_session",
              "review",
              "other",
            ],
          },
          startAt: { type: "string", format: "date-time" },
          endAt: { type: "string", format: "date-time" },
          allDay: { type: "boolean" },
          location: { type: "string" },
          status: { type: "string" },
          priority: { type: "string" },
          weight: { type: "number", minimum: 0 },
        },
      },
    },
  },
  "/v1/notifications": {
    get: {
      tags: ["notifications"],
      security: [{ bearerAuth: [] }],
      querystring: {
        ...pagination,
        properties: { ...pagination.properties, unreadOnly: { type: "boolean", default: false } },
      },
    },
  },
  "/v1/notifications/:notificationId/read": {
    patch: {
      tags: ["notifications"],
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["notificationId"],
        additionalProperties: false,
        properties: { notificationId: { type: "string", minLength: 1, maxLength: 220 } },
      },
    },
  },
  "/v1/file-extractions": {
    get: {
      tags: ["file-extractions"],
      security: [{ bearerAuth: [] }],
      querystring: {
        ...pagination,
        properties: {
          ...pagination.properties,
          fileId: uuidParam,
          status: {
            type: "string",
            enum: ["pending", "processing", "completed", "failed", "ocr_required"],
          },
        },
      },
    },
    post: {
      tags: ["file-extractions"],
      security: [{ bearerAuth: [] }],
      headers: {
        type: "object",
        properties: { "idempotency-key": { type: "string", minLength: 1, maxLength: 200 } },
      },
      body: {
        type: "object",
        required: ["fileId"],
        additionalProperties: false,
        properties: { fileId: uuidParam },
      },
    },
  },
  "/v1/file-extractions/:id": {
    get: { tags: ["file-extractions"], security: [{ bearerAuth: [] }] },
  },
  "/v1/file-extractions/:id/retry": {
    post: { tags: ["file-extractions"], security: [{ bearerAuth: [] }] },
  },
};

export const swaggerPlugin = fp(async (app) => {
  app.addHook("onRoute", (route) => {
    const pathDocs = domainDocs[route.url];
    const method = Array.isArray(route.method) ? route.method[0] : route.method;
    const methodDocs = pathDocs?.[method.toLowerCase()];
    if (methodDocs) route.schema = { ...route.schema, ...methodDocs };
    if (route.url.includes("/:id") || route.url.includes("/:subjectId")) {
      route.schema = {
        ...route.schema,
        params: {
          type: "object",
          properties: { id: uuidParam, subjectId: uuidParam, teacherId: uuidParam },
          additionalProperties: false,
        },
      };
    }
  });
  await app.register(swagger, {
    openapi: {
      info: { title: "Aulou API", description: "Backend do Aulou", version: "1.0.0" },
      servers: [{ url: "http://localhost:4000" }],
      tags: [
        { name: "health", description: "Health and readiness" },
        { name: "auth", description: "Authenticated user context" },
        { name: "semesters", description: "Semestres do estudante" },
        { name: "subjects", description: "Disciplinas do estudante" },
        { name: "teachers", description: "Professores do estudante" },
        { name: "academic-events", description: "Eventos academicos" },
        { name: "notifications", description: "Notificacoes do estudante" },
        { name: "file-extractions", description: "Extracao segura de documentos" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });
});
