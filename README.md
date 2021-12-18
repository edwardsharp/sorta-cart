# MARSHCOOP

## devel

create a file named `.env.local` (additionally `.env.test` for jest tests) with the requsite ENV variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON=
SQUARE_ENV=sandbox
SQUARE_ACCESS_TOKEN=
SQUARE_SIGNATURE_KEY=
```

**notes:**

`NEXT_PUBLIC_` prefix so is available browser-side.

`SQUARE_ENV` can be `sandbox` | `production`

`SQUARE_SIGNATURE_KEY` is the key from developer.squareup.com for the registered webhook

#### run a local development server:

```bash
npm run dev
```

open [http://localhost:3000](http://localhost:3000) with a browser.

## nextJS stuff:

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## supabase.io

generate types/supabase.ts (adjust supabase.co URL as needed)

```sh
npx openapi-typescript "https://ztasaotbeuyjupkyibgi.supabase.co/rest/v1/?apikey=${NEXT_PUBLIC_SUPABASE_ANON}" --output types/supabase.ts
```
