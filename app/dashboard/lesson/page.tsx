import { date } from "zod";
import HitCounter from "./hit-counter";
import { UsersCount } from "./users-count";
export default function page() {
    const date = new Date().toLocaleString();

    return (
        <>
            <p>Hello, Next!</p>
            <HitCounter>
                <UsersCount />
            </HitCounter>
            <br />
            <br />
            <div>Page rendered on {date}</div>
        </>
    );
}