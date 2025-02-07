import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
import { auth } from '@/auth';
import LoginButton from './loginButton';
// import { useSession } from 'next-auth/react';

export default function Page() {
  // const isLoggedIn = !!auth?.user;
  // const { data: session, status } = useSession();

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <div
            className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black"
          />
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            <strong>Welcome to Acme.</strong> This is the example for the{' '}
            <a href="https://nextjs.org/learn/" className="text-blue-500">
              Next.js Learn Course
            </a>
            , brought to you by Vercel.
          </p>
          <LoginButton />
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <Image
            src="/hero-desktop.png"
            width={1000}
            height={760}
            className="hidden md:block"
            alt="Screenshots of the dashboard project showing desktop version"
          />
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block md:hidden"
            alt="Screenshots of the dashboard project showing mobile version"
          />
        </div>
      </div>
    </main>
  );
}

{/* <form
action={async () => {
  'use server';
  await signOut();
}}
>
<button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
  <PowerIcon className="w-6" />
  <div className="hidden md:block">Sign Out</div>
</button>
</form> */}

// npm i next@latest (next@15.0.3)
// npm warn ERESOLVE overriding peer dependency
// npm warn While resolving: babel-eslint@11.0.0-beta.2
// npm warn Found: eslint@5.16.0
// npm warn node_modules/.pnpm/cross-spawn@7.0.6/node_modules/eslint
// npm warn   dev eslint@"^5.16.0" from cross-spawn@7.0.6
// npm warn   4 more (eslint-config-moxy, eslint-plugin-babel, ...)
// npm warn
// npm warn Could not resolve dependency:
// npm warn peer eslint@">= 6.0.0" from babel-eslint@11.0.0-beta.2
// npm warn node_modules/.pnpm/cross-spawn@7.0.6/node_modules/babel-eslint
// npm warn   babel-eslint@"^11.0.0-beta.0" from eslint-config-moxy@7.1.0
// npm warn   node_modules/.pnpm/cross-spawn@7.0.6/node_modules/eslint-config-moxy
// npm error Cannot read properties of null (reading 'matches')
// npm error A complete log of this run can be found in: C:\Users\Lev\AppData\Local\npm-cache\_logs\2025-01-28T12_58_05_459Z-debug-0.log       
