# App Core Concepts

This is quite a seminal piece of documentation for the system, since it describes how key concepts work within the app, and reviews some of the first code written here that stitches together key technologies. This code will likely not need to be changed throughout the development of the app, but it's important to review it for my own knowledge, as well as for potential future contributors.

This codebase is composed of a few different technologies. Most notably, NextJS, tRPC, Prisma, and TypeScript.
While setting up this application, I followed along with Jack Herrington's review of tRPC and NextJS to help get the boilerplate set up.
You can watch this and find more resources [here](https://youtu.be/qCLV0Iaq9zU?si=cJoBvyIADo5i8-ky) in the video description.

Be able to answer the questions: as an engineer, why would you reach for NextJS? Why would you reach for tRPC?

## What is TypeScript?

Good video explaining types [here](https://www.youtube.com/watch?v=Idf0zh9f3qQ).

Go to Definition F12 - Go to the source code of a symbol definition.
Peek Definition ⌥F12 - Bring up a Peek window that shows the definition of a symbol.
Go to References ⇧F12 - Show all references to a symbol.
Go to Type Definition - Go to the type that defines a symbol. For an instance of a class, this will reveal the class itself instead of where the instance is defined.
Go to Implementation ⌘F12 - Go to the implementations of an interface or abstract method.

## What is NextJS?

[NextJS](https://nextjs.org/) is a full stack JavaScript application development framework developed by Vercel.
It comes with a bundling tool called Turbopack. Built with rust, and integrates Turborepo to cache duplicate operations. This means NextJS automatically configures tooling you need for react link bundling, compiling, and more. Its a framework for React that improves speed and enhances the developer experience.

It comes with the following main features (listed in NextJS docs):

1. Routing: Client-side routing, configured using the file system structure.
2. Rendering: Client-side and server-side rendering with Client and Server components.
3. Data Fetching: Simplified data-fetching, extended `fetch` API for caching / cache revalidation. More info [here](https://youtu.be/gSSsZReIFRk?si=ALax3NuxwHpeXg1S).
4. Styling: supports many styling methods, i.e. CSS modules, Tailwind, CSS-in-JS, etc.
5. Optimizations: Image, font, and script optimization.
6. TypeScript: Improved support for typescript. More efficient compiling and better type checking.

### Routing

As of version 13.4, which was released on May 4th 2023, a stable version of the new App Router feature in NextJS was released.
The app router is quite different in that your routing configuration is based on the directory structure under `/app`.

Directories under `/app` are routes.
The way you structure your directories, and the way you name folders and files within it is how you configure your routing.

Below is an example configuration of client side routing using app directory in NextJS.

For example:

```
app
|__ users
|   |__ page.tsx               # 2
|   |__ [id]
|       |__ page.tsx
|
|__ movies
|   |__ page.tsx
|   |__ [id]
|       |__ page.tsx           # 3
|       |__ reviews
|          |__ page.tsx
|          |__ [id]
|             |__ page.tsx     # 4
|
|__ api
|   |__ someCustomHandler
|       |__ route.ts           # 6
|
|__ _components                # 5
|__ layout.tsx                 # 1
|__ page.tsx
```

The app router is able to specify routes in a fashion you're already familiar with. The routing configuration shown above enables the following routes:

- `/`
- `/users`
- `/users/:id`
- `/movies`
- `/movies/:id`
- `/movies/:id/reviews`
- `/movies/:id/reviews/:id`

Some conventions in the new App Router:

1. `layout.tsx`: The root layout of the entire app. Everything renders within this.
2. `page.tsx`: Page.tsx is what renders when visiting this specific route.
3. `movies/:id`: You're able to specify a route with a param by using square brackets. What you put in the square determines the name of the param for that route. In this case, a movie ID.
4. `movies/:id/reviews/:id`: With this pattern, you can logically extend this to more deeply nested routes.
5. `_components`: Any directory starting with an underscore is ignored by NextJS's app router. This means you can import components from this directory, but you won't be able to navigate to `/_components`.
6. `route.ts`: This is how you tell NextJS's app router that you have custom routes you want handled separately. This is part of how we handle the integration of tRPC into this project; more on that later.
7. `[...slug]`: Not shown in the above directory structure. This will capture the rest of the path into the param; in this case, `slug`.

All components are server components by default. By default all pages are cached so that performance is like a static site.

### Caching and Fetching

NextJS extends the native `fetch` api to allow you to configure the caching and revalidating behaviour for each `fetch` request on the server. Keep in mind that the way we cache and revalidate in NextJS does change slightly with the integration of tRPC, but I will cover that later on.

Also talk about how NextJS helps you work with cookies.

By default, all data fetches are static. This means that if we fetch data, this data is cached in the server for subsequent requests for the entirety of the life of the app.

As mentioned above, NextJS extends the `fetch` web api. In NextJS, we can modify the default caching behaviour by passing `fetch` some options.

For example:

```typescript
type Time = {
  datetime: string;
};

const res = await fetch(
  'https://worldtimeapi.org/api/timezone/America/Chicago',
  {
    cache: 'no-store' // <- here we change default caching behaviour
  }
);
const data: Time = await res.json();
```

In the above snippet, we want to bypass caching and fetch new data every time this request is called.

We can opt out of caching in many different ways. The above is just one example, but here are some more cases in which `fetch` does _not_ cache:

- setting `revalidate: 0`
- The `fetch` request is inside a router handler that uses the `POST` method (but why?)
- The `fetch` request comes after the usage of `headers` or `cookies` (what do you mean "after"?).
- the `const dynamic = 'force-dynamic'` route segment option is used (check what this looks like)
- the `fetchCache` route segment option is configured to skip cache by default
- the `fetch` request uses `Authorization` or `Cookie` headers and there's an uncached request above it in the component tree

(note to self - look into all these)

Next supports revalidation of cache. This is called Incremental Static Regeneration (ISR). For example:

```javascript
type Time = {
  datetime: string;
};

const res = await fetch(
  'https://worldtimeapi.org/api/timezone/America/Chicago',
  {
    next: {
      revalidate: 5,
    },
  }
);

const data: Time = await res.json();
```

This means that next will cache the data when this request is run for the first time; but for any subsequent requests made less than 5 seconds afterwards, next JS will fulfill the request using the cached value. After 5 seconds from the initial request, once a new request is made, new data will be fetched, then cached.

If you multiple fetch requests in a statically rendered route, and each has a different revalidation frequency, the lowest time will be used for all requests.

#### On-Demand Revalidation

Data can be revalidated either by path (`revalidatePath`), or by cache tag (`revalidateTag`), inside a route handler or server action.

When using `fetch`, you can tag cache entries with one or more tags.
Then, you call `revalidateTag` to revalidate all entries associated with that tag.

For example, in this snippet below, we fetch data and add the cache tag called `collection`.

```javascript
const res = await fetch('https://...', { next: { tags: ['collection'] } });
```

(further reading on this [here](https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation))

(either add this here or in another more "tRPC" specific section; however, you need to address how these cache revalidation strategies are usable in our app with tRPC)

### SSR vs CSR

`'use client'` and the implicit `'use server'`

In NextJS, we have the notion of rendering on the server-side (SSR). On the other hand, as we do conventionally with React, CSR (client-side rendering) is, as the name suggests, when we render rich user interactions on the client.

Giving developers the ability to effortlessly build rendered components for both server side and client side is one of the key capabilities of NextJS.

From what I understand, any component that is a child of a client component (uses `use client`), is itself a client component.

Why then is it that when I navigate to the page for `/` I see a console on the server side, if the component is a child of the trpc Provider? The Provider is a client component, so in theory the whole app should be a client component. Am I wrong? Are Providers exempt from this rule?

## What is tRPC?

In short, tRPC is a new way to facilitate client server interaction. But why? tRPC has two (from what I've seen so far) primary value propositions. Developer experience and consistent type safety between client and server.

Quick note: While tRPC and gRPC are both used for creating type-safe APIs, and while gRPC can be supported in multiple modern programming languages, it's tedious to work with. gRPC produces codes that are hard to read and debug.

### Developer Experience

tRPC's main tagline is to "move fast and break nothing".
Using tRPC means that when editing the server, TypeScript will warn you of errors in your client before you save the file.
Using tRPC also gives you intellisense in your client code. You'll get autocomplete in your client, even if you just created a new RPC in your server.

### Client-Server Type Safety

Since your routes and return types are defined in the tRPC router, and the FE client
uses the router type to make calls to the server, you essentially have guaranteed type consistency between the FE and BE.

In you FE, you call tRPC APIs by importing the `serverClient` from `app/_trpc/serverClient.ts`.

The imported `serverClient` is created by calling `.createCaller` on `appRouter`, which is defined in the index of the `server` directory. This is where all your app's routes are defined, like `listUsers`. The object passed into the `createCaller` function uses something called `httpBatchLink`, which is imported from `trpc/client`.

Also explain db configuration, including how you created a local test db.

## tRPC Integration into NextJS

The base of the app was created using `npx create-next-app@latest`.
Make sure to also talk about the request batching that tRPC supports, and how to configure this. More info [here](https://youtu.be/XY8zyvxFvqM?si=1ROQczpToGoapuqC&t=568);
Talk about what was done to integrate tRPC into the project:

### Add Dependencies

`yarn add @trpc/server`

For creating a tRPC router and connecting them to a server.

---

`yarn add @trpc/client`

Facilitates communicating with the tRPC server from the client side.
At the moment of writing, this library is only used to provide an `httpBatchLink`.

We use this to help create some kind of server client.
`httpBatchLink` is used when creating a client for the FE client, and also to create a separate client used only for server side rendering.

---

`yarn add @trpc/react-query`

Gives us what we need to create a React Provider for tRPC. The provider exposes react hooks to interact with the tRPC server, in our react code.

---

`yarn add @tanstack/react-query`

This seems to be what allows us to actually consume our hooks through the provider. This is still somewhat unclear.
However it seems that this is the library that allows us to interact with our react hooks the way we do in this app. For example:

```javascript
const getUsers = trpc.listUsers.useQuery();
```

However it seems that the `@trpc/react-query` is more responsible for setting up a FE client that knows how to talk
to our tRPC server. This bit is still a bit confusing so, note to self, once this makes more sense I'll update the documentation.

---

### Some Context about the Server / Client tRPC Setup

Add more information about this once you're able to.
However, from a high level, understand that:

`src/app/_trpc/serverClient` contains the export our _server_ components will use when consuming our tRPC procedures.

`src/app/_trpc/client` contains the export our _client_ components will use when consuming our tRPC procedures. As we'll see soon, this version of the tRPC client needs a Provider. More on that in a second.

### Create a Server

`src/app/server/trpc.ts`

Initializes the tRPC server, and exposes a router and public procedure (a public route, essentially).

### Configure Server and Routing

`src/app/server/index.ts`

This is where we bring in some of the important tools for building routers from `./trpc.ts`.
In `index.ts` however, we import sub-routers, and export the router's type alongside it in the same module.

roles / permissions / scopes

When doing self learning it's good to let the problem emerge first.

Keep your network alive. Reach out to people and reach out to old ppl.

- Whenever possible, get in touch with the hiring manager.

Document everything you learn.

Interviews are to provide interesting conversation pieces unique to me, and to inspire confidence.

Justify all your engineering decisions. It's not that one decision is objectively right or wrong, it's more so that good engineers have more options to choose from and evaluate their strengths and weaknesses.

### Route specific Client-side requests to Server.

So far with NextJS, we've seen that when the client calls on a certain route, the app router is able to show specific UIs for that route.

NextJS also allows you to set up custom route handlers, in case you want to define routes that you don't necessarily want the app router to handle the default way. More information [here](https://nextjs.org/docs/app/building-your-application/routing/route-handlers).

Recall point #6 under What is NextJS > Routing in this document.
This is how custom route handling is done. Custom routes are leveraged here for a portion of the work needed to integrate tRPC with next.

We have a custom route handler under `app/api/trpc/route.ts`. The purpose of this custom route handler is to route certain requests in our FE our TRPC instance, using an adapter that has knowledge about all our tRPC procedures.
The `fetchRequestHandler` adapter uses `fetch` under the hood, meaning NextJS is still able to cache data that we've fetched using tRPC. (This is somewhat of an assumption. Clarify this).

One thing is for sure; because of _this_ file (`app/api/trpc/route.ts`) that, hypothetically, we see the following behaviour.

1. Navigate to `localhost:3000/api/trpc/listUsers`.
2. Notice the output of the `listUsers` procedure directly in the browser window.

The dynamic portion (`[trpc]`) of the route in this case is the name of the procedure that we defined in `server/index.ts`.

Now that we have this functionality in place, the next crucial part about setting this up is to have our FE make these requests using the tRPC client.

For further research:

- Why do we need this handler? What step in the chain is this needed?
- Also, why does this adapter need to have knowledge about what's in our `appRouter`? I'd' figure that whatever calls these routes already has knowledge about our router right?

### tRPC Server Side Setup

### tRPC Client Side Setup

### Create a tRPC Provider

`src/app/_trpc/Provider.tsx`

FINISH THIS SECTION, WHETHER HERE OR OTHERWISE.
You need to be able to explain why, this happens:

I thought that every component that is a child of a client component is automatically also a client component. Why do we see the `page.tsx` component for `/` log the `console.log` to the server? It is a child of a client component; the `Provider.tsx`. Is my understanding of the rule incorrect? Is there something else going on here?

## What is Prisma?

Prisma is an ORM for Javascript apps.
Explain why you chose Prisma over other persistent data-store libraries.

### More about Prisma

Typescript Integration?

### To start using Prisma...

1. Install dev dependency: `yarn add prisma`.
2. Initialize prisma: `npx prisma init`.

The last command will generate your `schema.prisma` file, where you configure your database schema.

### Defining Models (schema.prisma)

As mentioned, we define our models in `schema.prisma`.
For more info, look at this video [here](https://youtu.be/RebA5J-rlwg?si=3DDh87uBKHymGJbM).

Example:

```prisma
model User {
  id  Int @id @default(autoincrement())
  name String?
  email String
}
```

#### ID Types

You can set up either an Integer ID or a UUID.

```prisma
id Int @id @default(autoincrement())
```

```prisma
id String @id @default(uuid())
```

#### All Other Types

From left to right we have the field name, field type, type modifier, then options.

Prisma Data Types:

- Int
- BigInt
- String
- Boolean
- Float **\_\_** Decimal supports a wider range of floating point numbers.
- Decimal \_\_|
- DateTime Only date type in Prisma.
- Json
- Bytes
- Unsupported("") You would never actually write this yourself; this field appears only when converting databases, which prisma has some support for.

Placing a `?` after a datatype like this `name String?` means the field of name is optional.
This means all columns are required by default.
This is known as a field type modifier. There are only two field type modifiers. The other field type modifier is the array modifier, `[]`.

`Float` and `Decimal` types are used to denote floating point numbers. `Float` is less specific than `Decimal`.

Here, make sure to also cover how the prisma syntax maps to different postgres data types / conventions.
ALSO talk about why you chose Postgres over other DBs.

### Relationships

#### One-to-one

```prisma
model User {
  // ...
  UserPreference UserPreference?
}

model UserPreference {
  user   User   @relation(fields: [userId], references: [id])
  userId String @unique
}
```

#### One-to-many

To specify a relationship within your schema, you just refer directly to another type like this:

```prisma
model User {
  id        Int       @id @default(autoincrement())
  name      String?
  email     String
  posts     Post[]                                                       // <- Relationship related
}

model Post {
  rating    Int
  createdAt DateTime
  updatedAt DateTime
  author    User      @relation(fields: [authorId], references: [id])     // <- Relationship related
  authorId  Int                                                           // <- Relationship related
}
```

This means that the `userId` field in our post references the `id` field in our `User` model.

#### Many-to-many

Many-to-many is probably the easiest to set up.

```prisma
model Category {
  // ...
  posts Post[]
}

model Post {
  categories Category[]
}
```

With this schema setup, Prisma will automatically create a join table a set up the right ID columns in that join table.

#### Other Attributes

So far all we talked about is `@id` and `@default`.

Other than that there are also:

- `@updatedAt`: Prisma will manage any field with this modifier. Prisma will update this field whenever the corresponding record is updated.
- `@default(now())`: Default to the current timestamp.

#### Block Level Attributes

These are ways to provide extra attributes for the entire table.
Denoted by `@@`.

```prisma
model User {
  // ...
  age  Int
  name String
  email String @unique
  // ...

  @@unique([age, name])
  @@index([email])
}
```

- `@@unique`:
- `@@index`:
- `@@id`: Allows you to create composite IDs.

#### Enums

Enums are useful when specifying things like roles.

```prisma
model User {
  //...
  role Role @default(BASIC)
}

enum Role {
  BASIC
  ADMIN
}
```

### Migrations

Typically, you would run `prisma migrate dev` to generate a migration for your app.
Initially when running `npx prisma init`, prisma creates a new folder in the root of your app called `prisma`.
In there is a blank schema, which you will fill in and modify over time.

Running your first migration creates a `migrations` folder within the new `prisma` directory.

Add more...

### Integrating Prisma into NextJS App

NextJS and Prisma treat `.env` files a bit differently. By default, Next only has `.env*.local` in `.gitignore` (FYI, this means we can use `.env-dev.local`, `.env-staging.local` for different environments). This means that a plain `.env` file will be committed to source control. Since this is a NextJS app using Prisma, I chose to adapt prisma to NextJS and not the other way around, by honouring the `.env.local` pattern and putting secrets in there; i.e. database URLs for instance.

Changing `.env` to `.env.local` is all well and good for now, but the thing is Prisma expects to read from an `.env` file.
Without access to one, Prisma won't be able to read a database URL to do operations like migrations, for example.

Fortunately, we can use a dev dependency called `dotenv-cli` to help specify an environment for Prisma without committing secrets to source control.

This does mean however that we need to add some scripts to our `package.json`.

```json
  ...,
  "migrate:dev": "npx dotenv -e .env.local -- prisma migrate dev",
  "db:push": "npx dotenv -e .env.local -- prisma db push",
  "migrate:reset": "npx dotenv -e .env.local -- prisma migrate reset",
  "db:seed": "npx dotenv -e .env.local -- prisma db seed",
  "prisma:generate": "npx dotenv -e .env.local -- prisma generate",
  "prisma:studio": "npx dotenv -e .env.local -- prisma studio",
  "production:build": "npx prisma generate && npx prisma migrate deploy && next build"
```

[Here](https://www.sammeechward.com/prisma-and-nextjs)'s a great resource for learning more about integrating Prisma into NextJS.

### Other Prisma Stuff

Cool tip: running `npx prisma format` from the command line formats your Prisma schema file.

## ABOUT DATA FETCHING - A PATTERN, AND AN IMPROVEMENT PROPOSITION

MOVE THIS TO THE RIGHT SECTION

With this stack, we obviously have a number of different ways to fetch data.

Here is one pattern that can be used for data fetching.
The idea is that when a user navigates to a certain page, it can be delivered to the client side with some data already preloaded.

Recall that we use two different clients, depending on whether we're rendering on the client side or server side.
`_trpc/client` and `_trpc/serverClient`.

Let's say you're an organization admin within the app, and you want to see the full list of users within your organization.

You may navigate to some FE route like `/admin/users`.

NOW; NextJS allows us to render a page's initial content (like a list fetched from the DB for example) completely on the server, then send this static content to the server. Then, whenever the user interacts with the page (i.e. modifying content), we can refetch the data from the server and render on the client side.

Within this app, here's how we may do that:

`page.tsx`

```javascript
import { serverClient } from './_trpc/serverClient';

import UserList from './_components/UserList';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const users = await serverClient.listUsers();
  return (
    <main className="max-w-3xl mx-auto mt-5">
      <UserList initialUsers={users} />
    </main>
  );
}
```

`UserList.tsx`

```javascript
'use client';
import { useState } from 'react';

import { trpc } from '../_trpc/client';
import { serverClient } from '../_trpc/serverClient';

export default function UserList({
  initialUsers,
}: {
  initialUsers: Awaited<ReturnType<(typeof serverClient)['listUsers']>>;
}) {
  const listUsers = trpc.listUsers.useQuery(undefined, {
    initialData: initialUsers,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const createUser = trpc.createUser.useMutation({
    onSettled: () => {
      listUsers.refetch();
    },
  });

  return (
    <>
      {
        listUsers?.data?.map() // render user
      }
      <button></button>
    </>
  );
};
```
