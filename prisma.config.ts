import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "backend/prisma/providers/sqlite/schema.prisma",
  datasource: {
    url: "file:./gyanpath.db",
  },
});