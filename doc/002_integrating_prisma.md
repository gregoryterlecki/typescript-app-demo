# Integrating Prisma

Talk a bit about design, and go over what this set of code changes introduces. Also show how/where to use the db functions.
Talk about db configuration, test db, etc.
Talk about your decisions when creating the stucture under `src/db` and `src/server`.

Current potential improvements:

- Precommit hook to test for prettier changes
  - What if, if formatting errors are detected during precommit, a prompt asks the developer if they would like to run the formatter?
- module exporting
- Refactor the `db/index.ts` file.
- Clean up front end code

[This page from Prisma](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/customizing-migrations) has some great extra information on how to make more advanced types of migrations.

## Structure of `src/db` and `src/server`.

The main goals of the backend code are as follows.

1. To provide backend code that is organized and intuitive.
2. To make code that is very easy and simple to scale.
3. Keep file sizes small.
4. Clear and concise name spacing of concepts, to minimize the hierarchy level needed (max 3 is ideal).

Try to limit to a max of 3 levels for both db and server, i.e:

- For the database: `db.User.Todo.getMostRecentlyCreated()`
- For the server: `trpc/user/1/todo/mostRecentlyCreated`

look at this resource for standardizing error formatting:
https://github.com/trpc/examples-next-prisma-starter/blob/main/src/server/trpc.ts

# Notes

One quirky / weird aspect of working with this stack is that it doesn't seem `Date` types can be sent in a response from the server back to the client. This could very well be the case for sending data _to_ the server as well, although at the time of this writing this hasn't been done yet. Will get there soon.

The way I came across this problem in the first place though is important to understand the solution.
At the time, I was trying to supply the `initialData` option to `useQuery()`.
I was also passing in the initial data into this component as a prop.
When I was typing the prop, I used the typing from the example: `Awaited<ReturnType<(typeof serverClient)['user']['list']>>`.
However, my thinking is, that the trpc client is aware of the fact that FE <-> BE interactions here can't support `Date` types fully.
And because of this, it might be important to look for another type.

A solution to this should be found. Not the biggest priority right now, but definitely something to put into the backlog of housekeeping items.
