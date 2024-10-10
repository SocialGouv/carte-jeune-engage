/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import getPayloadClient from "~/payload/payloadClient";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";
import { Payload } from "payload";
import { NextApiRequest } from "next";

export type PayloadJwtSession = {
  id: number;
  email: string;
  iat: string;
  exp: string;
} | null;

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = Record<string, never>;

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
// const createInnerTRPCContext = (: FetchCreateContextFnOptions) => {
//   return {};
// };

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
type CustomTRPCContext = {
  payload: Payload;
  session: PayloadJwtSession;
  req?: NextApiRequest;
};

export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  const payload = await getPayloadClient({
    seed: false,
  });

  const jwtCookie =
    _opts.req.cookies[process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"];

  if (!jwtCookie) {
    return {
      payload,
      session: null,
      req: _opts.req,
    };
  }

  const session = jwtDecode<PayloadJwtSession>(jwtCookie);

  return {
    payload,
    session,
    req: _opts.req,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const isAuthedAsSupervisor = t.middleware(async ({ next, ctx }) => {
  const supervisor = await ctx.payload.find({
    collection: "supervisors",
    where: {
      email: {
        equals: ctx.session?.email,
      },
    },
  });

  if (ctx.session?.email === undefined || !supervisor.docs.length) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to perform this action",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

const isAuthedAsUser = t.middleware(async ({ next, ctx }) => {
  const user = await ctx.payload.find({
    collection: "users",
    where: {
      email: {
        equals: ctx.session?.email,
      },
    },
  });

  if (ctx.session?.email === undefined || !user.docs.length) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to perform this action",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

const hasWidgetToken = t.middleware(async ({ next, ctx }) => {
  try {
    const token = ctx.req?.cookies["widget-token"];

    if (!token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication token is missing",
      });
    }

    jwt.verify(token, process.env.WIDGET_SECRET_JWT!);

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid token",
      });
    }

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    });
  }
});

const isAuthedAsUserOrWidgetToken = t.middleware(async ({ next, ctx }) => {
  try {
    const user = await ctx.payload.find({
      collection: "users",
      where: {
        email: {
          equals: ctx.session?.email,
        },
      },
    });

    if (ctx.session?.email && user.docs.length) {
      return next({
        ctx: {
          session: ctx.session,
        },
      });
    }

    const token = ctx.req?.cookies["widget-token"];
    if (token) {
      jwt.verify(token, process.env.WIDGET_SECRET_JWT!);
      return next();
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User authentication or widget token required",
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid token",
      });
    }

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    });
  }
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

export const createCallerFactory = t.createCallerFactory;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

export const userProtectedProcedure = t.procedure.use(isAuthedAsUser);
export const supervisorProtectedProcedure =
  t.procedure.use(isAuthedAsSupervisor);
export const widgetTokenProtectedProcedure = t.procedure.use(hasWidgetToken);
export const userOrWidgetProtectedProcedure = t.procedure.use(
  isAuthedAsUserOrWidgetToken
);
