import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { auth } from "../auth"
import { Session } from 'next-auth';

export default async function LoginButton () {
    // const { user } = await auth().user?.name;
    const  session = await auth();
    if (!session) {
        return <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
        >
            <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
        </Link>;
    }
    return (
        <div>
            {/* <h1>Сессия:</h1> */}
            {/* <p>{session ? `Session ID: ${session}` : 'Сессия не найдена'}</p> */}
            <h2>Вы вошли в систему как {session.user?.name}</h2>
            {true && <Link
                href="/erp"
                className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
            >
                <span>demo ERP</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>}
        </div>
    );
};

// export default LoginButton;
