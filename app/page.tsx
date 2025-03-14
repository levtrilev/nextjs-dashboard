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
      <div className="flex h-16 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <div
            className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black"
          />
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-2xl md:leading-normal`}>
            <strong>Welcome to Next JS ERP</strong>
            <br />
            Это демо-приложение для проекта{' '}
            <a href="https://github.com/levtrilev/nextjs-dashboard" className="text-blue-500">
              {"ERP-система с использованием React Server Components  "}
            </a>
            <br />
          </p>
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-xl md:leading-normal`}>
            by levtrishankov@yandex.ru
          </p>
          <LoginButton />
          Demo:  user2@ya.ru   pwd: 123456
        </div>
        <div className="flex items-center justify-center p-3 md:w-4/5 md:px-7 md:py-3">
          {/* <Image
            src="/hero-desktop.png"
            width={1000}
            height={760}
            className="hidden md:block"
            alt="Screenshots of the dashboard project showing desktop version"
          /> */}
          <Image
            src="/nexterp-desktop.png"
            width={1200}
            height={912}
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

